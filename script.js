// Number Picker Slot Machine JavaScript

class NumberPickerSlotMachine {
    constructor() {
        this.reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ];
        this.spinButton = document.getElementById('spinButton');
        this.maxNumberInput = document.getElementById('maxNumber');
        this.spinSound = document.getElementById('spinSound');
        this.isSpinning = false;
        this.spinDuration = 3000; // 3 seconds total
        this.spinSpeed = 100; // milliseconds between reel updates
        this.reelStopDelays = [2000, 3000, 4000]; // When each reel stops (in ms)
        
        this.initializeEventListeners();
        this.generateInitialNumbers();
    }


    initializeEventListeners() {
        this.spinButton.addEventListener('click', () => {
            this.playSpinClickSound();
            this.spin();
        });
        this.maxNumberInput.addEventListener('change', () => this.validateMaxNumber());
        
        // Prevent form submission on Enter key
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isSpinning) {
                e.preventDefault();
                this.spin();
            }
        });
    }

    validateMaxNumber() {
        const maxNumber = parseInt(this.maxNumberInput.value);
        if (maxNumber < 1) {
            this.maxNumberInput.value = 1;
        } else if (maxNumber > 999) {
            this.maxNumberInput.value = 999;
        }
    }


    generateInitialNumbers() {
        const maxNumber = parseInt(this.maxNumberInput.value);
        const validNumbers = this.generateValidNumbers(maxNumber);
        
        this.reels.forEach((reel, index) => {
            const slots = reel.querySelectorAll('.reel-slot');
            slots.forEach((slot, slotIndex) => {
                const number = validNumbers[index];
                slot.textContent = number;
                slot.setAttribute('data-number', number);
            });
        });
    }

    generateRandomNumbers() {
        const maxNumber = parseInt(this.maxNumberInput.value);
        return this.generateValidNumbers(maxNumber);
    }

    generateValidNumbers(maxNumber) {
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loops
        
        while (attempts < maxAttempts) {
            const numbers = [];
            
            // Generate each digit
            for (let i = 0; i < 3; i++) {
                numbers.push(Math.floor(Math.random() * 10));
            }
            
            // Convert to 3-digit number
            const threeDigitNumber = numbers[0] * 100 + numbers[1] * 10 + numbers[2];
            
            // Check if it's within the max limit
            if (threeDigitNumber <= maxNumber) {
                return numbers;
            }
            
            attempts++;
        }
        
        // Fallback: if we can't generate a valid number, return the max number digits
        const maxStr = maxNumber.toString().padStart(3, '0');
        return [
            parseInt(maxStr[0]),
            parseInt(maxStr[1]),
            parseInt(maxStr[2])
        ];
    }

    async spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.spinButton.textContent = 'SPINNING...';
        
        
        // Generate final numbers
        const finalNumbers = this.generateRandomNumbers();
        
        // Start spinning all reels
        const spinPromises = this.reels.map((reel, index) => 
            this.spinReel(reel, index, finalNumbers[index])
        );
        
        // Wait for all reels to finish spinning
        await Promise.all(spinPromises);
        
        // Result is already displayed on the reels
        
        // Reset button state
        this.spinButton.disabled = false;
        this.spinButton.textContent = 'SPIN';
        this.isSpinning = false;
    }

    async spinReel(reel, reelIndex, finalNumber) {
        const slots = reel.querySelectorAll('.reel-slot');
        const stopDelay = this.reelStopDelays[reelIndex];
        
        // Start spinning animation
        reel.classList.add('spinning');
        
        // Create spinning effect
        const spinInterval = setInterval(() => {
            slots.forEach(slot => {
                const randomNumber = Math.floor(Math.random() * 10);
                slot.textContent = randomNumber;
                slot.setAttribute('data-number', randomNumber);
            });
        }, this.spinSpeed);
        
        // Stop this reel after its delay
        await this.delay(stopDelay);
        
        // Stop spinning and set final number
        clearInterval(spinInterval);
        reel.classList.remove('spinning');
        
        // Set final numbers with animation
        slots.forEach((slot, slotIndex) => {
            slot.textContent = finalNumber;
            slot.setAttribute('data-number', finalNumber);
            
            // Highlight the middle slot (the visible one)
            if (slotIndex === 1) {
                slot.classList.add('highlighted');
            } else {
                slot.classList.remove('highlighted');
            }
        });
    }

    playSpinClickSound() {
        const audioElement = this.spinSound || document.getElementById('spinSound');
        if (!audioElement) {
            return;
        }
        audioElement.currentTime = 0;
        const playPromise = audioElement.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                // Ignore playback errors (e.g., browser policies)
            });
        }
    }


    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Method to get current visible numbers
    getCurrentNumbers() {
        const numbers = [];
        this.reels.forEach(reel => {
            const middleSlot = reel.querySelector('.reel-slot:nth-child(2)');
            numbers.push(parseInt(middleSlot.getAttribute('data-number')));
        });
        return numbers;
    }

    // Method to set specific numbers (for testing or custom functionality)
    setNumbers(numbers) {
        if (numbers.length !== 3) {
            console.error('Must provide exactly 3 numbers');
            return;
        }
        
        this.reels.forEach((reel, index) => {
            const slots = reel.querySelectorAll('.reel-slot');
            slots.forEach(slot => {
                slot.textContent = numbers[index];
                slot.setAttribute('data-number', numbers[index]);
                
                // Highlight the middle slot
                if (slot === slots[1]) {
                    slot.classList.add('highlighted');
                } else {
                    slot.classList.remove('highlighted');
                }
            });
        });
    }
}

// Initialize the slot machine when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const slotMachine = new NumberPickerSlotMachine();
    
    // Add some additional interactive features
    
    // Double-click to quick spin
    document.querySelectorAll('.reel').forEach(reel => {
        reel.addEventListener('dblclick', () => {
            if (!slotMachine.isSpinning) {
                slotMachine.spin();
            }
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !slotMachine.isSpinning) {
            e.preventDefault();
            slotMachine.spin();
        }
    });
    
    // Add visual feedback for max number input
    const maxInput = document.getElementById('maxNumber');
    maxInput.addEventListener('input', () => {
        const value = parseInt(maxInput.value);
        if (value >= 1 && value <= 999) {
            maxInput.style.borderColor = '#27ae60';
        } else {
            maxInput.style.borderColor = '#e74c3c';
        }
    });
    
    
    // Console commands for debugging/testing
    window.slotMachine = slotMachine;
    console.log('Slot Machine initialized! Try these commands:');
    console.log('slotMachine.spin() - Spin the reels');
    console.log('slotMachine.getCurrentNumbers() - Get current visible numbers');
    console.log('slotMachine.setNumbers([1, 2, 3]) - Set specific numbers');
});

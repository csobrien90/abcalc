class Calculator {
	// Define Enum Properties
	static Operators = {
		'add': '+',
		'subtract': '-',
		'multiply': 'x',
		'multiplyalt': '*',
		'divide': '/',
		'raise-to-power': '^',
	}

	static Numbers = {
		'zero': '0',
		'one': '1',
		'two': '2',
		'three': '3',
		'four': '4',
		'five': '5',
		'six': '6',
		'seven': '7',
		'eight': '8',
		'nine': '9'
	}

	static AllKeys = {
		'equals': '=',
		'enter': '=',
		'space': '=',
		' ': '=',
		'decimal': '.',
		'.': '.',
		'clear': 'clear',
		'c': 'clear',
		'backspace': 'backspace',
		...Calculator.Numbers,
		...Calculator.Operators
	}

	static States = {
		INITIAL: 'initial',
		FIRST: 'first',
		OPERATOR: 'operator',
		SECOND: 'second'
	}

	// Constructor
	constructor() {
		// DOM Bindings
		this.domElements = {
			calculator: document.querySelector('#calculator'),
			display: document.querySelector('#calculator #input-display'),
			buttons: [...document.querySelectorAll('#calculator .btn')],
			error: document.querySelector('#calculator #error'),
			ariaError: document.querySelector('#calculator #non-visual-error')
		}

		// Throw error if any DOM bindings failed
		if (!this.domElements.calculator || !this.domElements.display || this.domElements.buttons.length === 0 || !this.domElements.error || !this.domElements.ariaError) {
			throw new Error('DOM Bindings Failed - unable to instantiate calculator')
		}

		// Add Event Listeners (buttons and keyboard)
		this.domElements.buttons.forEach(button => {
			button.addEventListener('click', () => {
				this.handleInput(this.getKey(button))
				document.activeElement.blur()
			})
		})

		document.addEventListener('keydown', (e) => {
			// Ignore keydown events if key pressed is not bound to a calculator button
			if (!this.isValidKey(e.key.toLowerCase())) return

			// If key is enter or space, allow default behavior for buttons
			if (e.target.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) return 

			// Prevent default behavior, unless ctrl, meta/cmd key is pressed or key is enter or space
			if (!e.ctrlKey && !e.metaKey) e.preventDefault()
			this.handleInput(e.key)
		})

		// Set Initial State
		this.history = []
		this.reset()
	}

	// State Machine
	handleInput(key) {
		// Convert key to internal representation
		key = this.convertKey(key)
		
		// If clear is pressed, reset calculator
		if (key === 'clear') {
			this.reset()
			return
		}

		// If equals is pressed and we are not in the second state, ignore
		if (key === '=' && this.state !== Calculator.States.SECOND) return

		// Call appropriate handler based on current state
		switch (this.state) {
			case Calculator.States.INITIAL:
				this.handleInitialInput(key)
				break
			case Calculator.States.FIRST:
				this.handleFirstInput(key)
				break
			case Calculator.States.OPERATOR:
				this.handleOperatorInput(key)
				break
			case Calculator.States.SECOND:
				this.handleSecondInput(key)
				break
			default:
				this.showError('Invalid State - what even happened?')
				this.reset()
				break
		}

		// Try to update display
		try {
			this.updateDisplay()
		} catch (e) {
			// If error, show message and reset calculator
			this.showError(e.message)
			this.reset()
		}
	}

	handleInitialInput(key) {
		/* Initial State (initial)
			-> Can accept numbers, decimal, or negative sign
			-> Can not accept equals, initial backspace, or initial clear
			-> If result of previous equation, can accept (one) decimal and anything except equals
			-> Forward state on valid input
		*/

		// Block disallowed inputs
		let isAllowed = false
		if (this.equation.a === 0) {
			if (key === 'backspace' || key === '=') {
				isAllowed = false;
			} else if (key === '-') {
				isAllowed = true;
			} else if (Object.values(Calculator.Operators).includes(key)) {
				isAllowed = false;
			} else {
				isAllowed = true
			}
		} else {
			if (key === '=' || (key ==='.' && this.equation.a.includes('.'))) {
				isAllowed = false
			} else {
				isAllowed = true
			}
		}

		if (!isAllowed) {
			this.sendErrorToScreenreader('Invalid Input: ' + key)
			return
		}

		// Handle all allowed inputs
		if (this.equation.a === 0) {
			if (key === '-') {
				this.equation.a = '-'
			} else if (key === '.') {
				this.equation.a = '0.'
			} else {
				this.equation.a = key
			}
		} else {
			if (key === '.') {
				this.equation.a += '.'
			} else if (key === 'backspace') {
				this.equation.a = this.equation.a.slice(0, -1)
				if (this.equation.a.length === 0) this.reset()
			} else if (Object.values(Calculator.Operators).includes(key)) {
				// If operator, set operator, move to operator state, and return
				this.equation.operation = key
				this.state = Calculator.States.OPERATOR
				return
			} else {
				this.equation.a = key
			}
		}

		// Move to first state
		this.state = Calculator.States.FIRST
	}

	handleFirstInput(key) {
		/* First State (first)
			-> Backward state on backspace to length 0
			-> Can accept numbers, decimal (if no decimal already), and operators (if last character is not a negative or decimal)
			-> Can not accept equals
			-> Forward state on operator	
		*/

		// Block disallowed inputs
		let isAllowed = false
		if ((key === '.' && this.equation.a.includes('.'))
			|| (Object.values(Calculator.Operators).includes(key) && !Object.values(Calculator.Numbers).includes(this.equation.a.slice(-1)))
			|| (key === '0' && this.equation.a === '0')
		) {
			isAllowed = false
		} else {
			isAllowed = true
		}

		if (!isAllowed) {
			this.sendErrorToScreenreader('Invalid Input: ' + key)
			return
		}

		// Handle all allowed inputs
		if (key === 'backspace') {
			this.equation.a = this.equation.a.slice(0, -1)
			if (this.equation.a.length === 0) {
				this.reset()
			}
		} else if (key === '.') {
			this.equation.a += '.'
		} else if (Object.values(Calculator.Operators).includes(key)) {
			this.equation.operation = key
			this.state = Calculator.States.OPERATOR
		} else {
			this.equation.a += key
		}
	}

	handleOperatorInput(key) {
		/* Operator Component (operator)
			-> Backward state on backspace
			-> Only one operator allowed, new operator replaces old
			-> Can not accept equals
			-> Forward state on number, decimal, or negative sign
		*/

		// Block disallowed inputs
		let isAllowed = false
		if (key === '=') {
			isAllowed = false
		} else {
			isAllowed = true
		}

		if (!isAllowed) {
			this.sendErrorToScreenreader('Invalid Input: ' + key)
			return
		}
		
		// Handle all allowed inputs
		if (key === 'backspace') {
			this.equation.operation = null
			this.state = Calculator.States.FIRST
		} else if (key === '-') {
			this.equation.b = '-'
			this.state = Calculator.States.SECOND
		} else if (Object.values(Calculator.Operators).includes(key)) {
			this.equation.operation = key
		} else if (key === '.') {
			this.equation.b = '0.'
			this.state = Calculator.States.SECOND
		} else {
			this.equation.b = key
			this.state = Calculator.States.SECOND
		}
	}

	handleSecondInput(key) {
		/* Second Component (second)
			-> Backward state on backspace to length 0
			-> Can accept equals, numbers, decimal (if no decimal)
			-> Forward state on equals (calculate and set state to Initial Character (with filled result))
		*/

		// Block disallowed inputs
		let isAllowed = false
		const lastChar = this.equation.b.slice(-1)
		if (key === '=') {
			if (lastChar === '.' || lastChar === '-') {
				isAllowed = false
			} else {
				isAllowed = true
			}
		} else if (key === '.' && this.equation.b.includes('.')) {
			isAllowed = false
		} else if (key === '-' && lastChar === '-') {
			isAllowed = false
		} else {
			isAllowed = true
		}

		if (!isAllowed) {
			this.sendErrorToScreenreader('Invalid Input: ' + key)
			return
		}

		// Handle all allowed inputs
		if (key === 'backspace') {
			this.equation.b = this.equation.b.slice(0, -1)
			if (this.equation.b.length === 0) {
				this.equation.b = null
				this.state = Calculator.States.OPERATOR
			}
		} else if (key === '.') {
			this.equation.b += '.'
		} else if (key === '=') {
			// Calculate result, push to history, and reset to initial state with result as first operand
			const result = this.operate(parseFloat(this.equation.a), parseFloat(this.equation.b), this.equation.operation)
			this.history.push(Object.values(this.equation).join(' ') + ' = ' + result)
			this.equation = {
				a: result,
				operation: null,
				b: null
			}
			this.state = Calculator.States.INITIAL
		} else if (Object.values(Calculator.Operators).includes(key)) {
			// When an operator is entered, calculate the result, set the result as the first operand, and set the operator
			const result = this.operate(parseFloat(this.equation.a), parseFloat(this.equation.b), this.equation.operation)
			this.history.push(Object.values(this.equation).join(' ') + ' = ' + result)
			this.equation = {
				a: result,
				operation: key,
				b: null
			}
			this.state = Calculator.States.OPERATOR
		} else {
			this.equation.b += key
		}
	}

	// Display Functions
	updateDisplay() {
		const equation = Object.values(this.equation).filter(val => val !== null)

		// If no equation, display last result
		if (equation.length === 0) {
			this.domElements.display.value = this.history[this.history.length - 1]
			return
		}

		// Validate operands
		if (isNaN(parseFloat(equation[0])) && equation[0] !== '0.' && equation[0] !== '-') { // a is a number
			this.sendErrorToScreenreader('First operand is not a number - resetting calculator')
			this.reset()
			return
		} else if (equation.length > 1 && !Object.values(Calculator.Operators).includes(equation[1])) { // operator is valid
			this.sendErrorToScreenreader('Operator is not valid - resetting calculator')
			this.reset()
			return
		} else if (equation.length > 2  && equation[2] !== '0.' && equation[2] !== '-' && isNaN(parseFloat(equation[2]))) { // b is a number
			this.sendErrorToScreenreader('Second operand is not a number - resetting calculator')
			this.reset()
			return
		}

		// Format operands - handle negatives and decimals individually for readability
		switch (equation.length) {
			case 1:
			case 2:
				if (equation[0] === '-') {
					equation[0] = '-'
				} else if (equation[0][equation[0].length - 1] === '.') {
					// Let it be
				} else {
					equation[0] = this.formatNumber(equation[0])
				}
				break
			case 3:
				equation[0] = this.formatNumber(equation[0])

				if (equation[2] === '-') {
					equation[2] = '-'
				} else if (equation[2] === '0.') {
					equation[2] = '0.'
				} else {
					equation[2] = this.formatNumber(equation[2])
				}
				break
			default:
				this.reset()
				break
		}
		
		// Display Equation
		this.domElements.display.setAttribute('value', equation.join(' '))
	}

	formatNumber(number) {
		// Default formatting options
		const options = {
			style: 'decimal',
			useGrouping: true,
			minimumFractionDigits: 0,
			maximumFractionDigits: 8,
		}

		// If number is an integer, remove decimal places
		if (number % 1 === 0) {
			options.minimumFractionDigits = 0
			options.maximumFractionDigits = 0
		}

		// If number is  0 or -0, set decimal places to match number of decimal places
		if (+number === 0 || +number === -0) {
			if (number.toString().includes('.')) {
				options.minimumFractionDigits = number.toString().split('.')[1].length
				options.maximumFractionDigits = number.toString().split('.')[1].length
			} else {
				options.minimumFractionDigits = 0
				options.maximumFractionDigits = 0
			}
		} else if (number > 99999999
			|| number < -99999999
			|| (number > -0.00000001 && number < 0.00000001)) {
			// If number is too large or too small, use scientific notation
			options.useGrouping = false
			options.minimumFractionDigits = 0
			options.maximumFractionDigits = 2
			options.notation = 'scientific'
		}


		// If number is infinity, show error
		if (+number === Infinity || +number === -Infinity) {
			throw new Error('"Infinity" is too large to display')
		}

		// Instantiate number formatter for user's selected locale
		return new Intl.NumberFormat(navigator.language, options).format(number)
	}
	
	showError(message, reset = false) {
		// Show visual error
		this.domElements.error.innerText = message
		this.domElements.error.style.display = 'block'

		// Remove error after 2 seconds
		setTimeout(() => {
			this.domElements.error.style.display = 'none'
		}, 2000)

		// Reset calculator if flag is set
		if (reset) {
			this.reset()
		}
	}

	sendErrorToScreenreader(message) {
		this.domElements.ariaError.innerText = message
	}

	// Utility Functions
	operate(a, b, operator) {
		switch(operator) {
			case '+':
				return (a + b).toString()
			case '-':
				return (a - b).toString()
			case 'x':
				return (a * b).toString()
			case '/':
				return (a / b).toString()
			case '^':
				return (a ** b).toString()
		}
	}

	reset() {
		this.history.push(0) // Push 0 to history to maintain history
		this.state = Calculator.States.INITIAL
		this.equation = {
			a: 0,
			operation: null,
			b: null
		}

		try {
			this.updateDisplay()
		} catch (e) {
			this.showError('Error: reset failed - this should never happen')
		}
	}

	getKey(button) {
		// Get key from button
		return Calculator.AllKeys[button.id] || false
	}

	isValidKey(key) {
		return Object.values(Calculator.AllKeys).includes(key.toLowerCase())
			|| Object.keys(Calculator.AllKeys).includes(key.toLowerCase())
	}

	convertKey(key) {
		// Convert keys to internal representation
		key = key.toLowerCase()
		
		if (key === 'enter' || key === ' ') {
			key = '='
		} else if (key === '*') {
			key = 'x'
		} else if (key ==='c') {
			key = 'clear'
		}

		return key
	}
}

const calculator = new Calculator()
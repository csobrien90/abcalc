class TestCalculator {
	constructor() {
		this.setup();
		this.testResults = {
			pass: [],
			fail: []
		}
		this.test();
		console.log(this.testResults);
	}

	test() {
		// Combine all tests
		this.testReset();
		this.testState();
		this.testMath();
		this.testDisplay();
	}

	// Reset Tests
	testReset() {
		this.setup();
		this.type('1');
		this.type('+');
		this.type('2');
		this.type('=');
		this.type('x');
		this.type('3');

		// Confirm that the equation is not reset
		if (+this.calculator.equation.a !== 3) {
			this.fail('testReset 1a', this.calculator);
		} else {
			this.pass('testReset 1a');
		}

		if (this.calculator.equation.operation !== 'x') {
			this.fail('testReset 1b', this.calculator);
		} else {
			this.pass('testReset 1b');
		}

		if (+this.calculator.equation.b !== 3) {
			this.fail('testReset 1c', this.calculator);
		} else {
			this.pass('testReset 1c');
		}

		if (this.calculator.state !== 'second') {
			this.fail('testReset 1d', this.calculator);
		} else {
			this.pass('testReset 1d');
		}

		if (this.calculator.history[1] !== '1 + 2 = 3') {
			this.fail('testReset 1e', this.calculator);
		} else {
			this.pass('testReset 1e');
		}

		this.calculator.reset();
		if (this.calculator.equation.a !== 0) {
			this.fail('testReset 2a', this.calculator);
		} else {
			this.pass('testReset 2a');
		}

		if (this.calculator.equation.operation !== null) {
			this.fail('testReset 2b', this.calculator);
		} else {
			this.pass('testReset 2b');
		}

		if (this.calculator.equation.b !== null) {
			this.fail('testReset 2c', this.calculator);
		} else {
			this.pass('testReset 2c');
		}

		if (this.calculator.state !== 'initial') {
			this.fail('testReset 2d', this.calculator);
		} else {
			this.pass('testReset 2d');
		}

		if (+this.calculator.history.slice(-1)[0] !== 0) {
			this.fail('testReset 2e', this.calculator);
		} else {
			this.pass('testReset 2e');
		}
	}

	// State Tests
	testState() {
		this.testInitialState();
		this.testFirstState();
		this.testOperatorState();
		this.testSecondState();
	}

	testInitialState() {
		/* Normal Use Cases */

		// Test 1 - Number
		this.setup();
		this.type('1');
		if (this.calculator.equation.a !== '1') {
			this.fail('testInitialState 1a', this.calculator);
		} else {
			this.pass('testInitialState 1a');
		}

		this.setup();
		this.click('one')
		if (this.calculator.equation.a !== '1') {
			this.fail('testInitialState 1b', this.calculator);
		} else {
			this.pass('testInitialState 1b');
		}

		if (this.calculator.state !== 'first') {
			this.fail('testInitialState 1c', this.calculator);
		} else {
			this.pass('testInitialState 1c');
		}

		// Test 2 - Decimal
		this.setup();
		this.type('.');
		if (this.calculator.equation.a !== '0.') {
			this.fail('testInitialState 2a', this.calculator);
		} else {
			this.pass('testInitialState 2a');
		}

		this.setup();
		this.click('decimal');
		if (this.calculator.equation.a !== '0.') {
			this.fail('testInitialState 2b', this.calculator);
		} else {
			this.pass('testInitialState 2b');
		}

		if (this.calculator.state !== 'first') {
			this.fail('testInitialState 2c', this.calculator);
		} else {
			this.pass('testInitialState 2c');
		}

		// Test 3 - Negative
		this.setup();
		this.type('-');
		if (this.calculator.equation.a !== '-') {
			this.fail('testInitialState 3a', this.calculator);
		} else {
			this.pass('testInitialState 3a');
		}
		
		this.setup();
		this.click('subtract');
		if (this.calculator.equation.a !== '-') {
			this.fail('testInitialState 3b', this.calculator);
		} else {
			this.pass('testInitialState 3b');
		}

		if (this.calculator.state !== 'first') {
			this.fail('testInitialState 3c', this.calculator);
		} else {
			this.pass('testInitialState 3c');
		}

		/* Edge Cases */
		
		// Test 4 - Equals
		this.setup();
		this.type('=');
		if (this.calculator.equation.a !== 0) {
			this.fail('testInitialState 4a', this.calculator);
		} else {
			this.pass('testInitialState 4a');
		}

		this.setup();
		this.type(' ');
		if (this.calculator.equation.a !== 0) {
			this.fail('testInitialState 4b', this.calculator);
		} else {
			this.pass('testInitialState 4b');
		}

		this.setup();
		this.type('Enter');
		if (this.calculator.equation.a !== 0) {
			this.fail('testInitialState 4c', this.calculator);
		} else {
			this.pass('testInitialState 4c');
		}

		this.setup();
		this.click('equals');
		if (this.calculator.equation.a !== 0) {
			this.fail('testInitialState 4d', this.calculator);
		} else {
			this.pass('testInitialState 4d');
		}

		if (this.calculator.state !== 'initial') {
			this.fail('testInitialState 4e', this.calculator);
		} else {
			this.pass('testInitialState 4e');
		}

		// Test 5 - Backspace
		this.setup();
		this.type('Backspace');
		if (this.calculator.equation.a !== 0) {
			this.fail('testInitialState 5a', this.calculator);
		} else {
			this.pass('testInitialState 5a');
		}

		this.setup();
		this.type('Backspace');
		if (this.calculator.equation.a !== 0) {
			this.fail('testInitialState 5b', this.calculator);
		} else {
			this.pass('testInitialState 5b');
		}

		// Test 6 - Clear
		this.setup();
		this.type('clear');
		if (this.calculator.equation.a !== 0) {
			this.fail('testInitialState 6a', this.calculator);
		} else {
			this.pass('testInitialState 6a');
		}

		this.setup();
		this.type('c');
		if (this.calculator.equation.a !== 0) {
			this.fail('testInitialState 6b', this.calculator);
		} else {
			this.pass('testInitialState 6b');
		}

		this.setup();
		this.click('clear');
		if (this.calculator.equation.a !== 0) {
			this.fail('testInitialState 6c', this.calculator);
		} else {
			this.pass('testInitialState 6c');
		}

		// Test 7 - Operator
		this.setup();
		this.type('+');
		if (this.calculator.equation.a !== 0) {
			this.fail('testInitialState 7a', this.calculator);
		} else {
			this.pass('testInitialState 7a');
		}

		this.setup();
		this.click('add');
		if (this.calculator.equation.a !== 0) {
			this.fail('testInitialState 7b', this.calculator);
		} else {
			this.pass('testInitialState 7b');
		}

		// Test 8 - Invalid Character
		this.setup();
		this.type('a');
		if (this.calculator.equation.a !== 0) {
			this.fail('testInitialState 8a', this.calculator);
		} else {
			this.pass('testInitialState 8a');
		}
	}

	testFirstState() {
		/* Normal Use Cases */

		// Test 1 - Number
		this.setup();
		this.type('1');
		this.type('2');
		if (+this.calculator.equation.a !== 12) {
			this.fail('testFirstState 1a', this.calculator);
		} else {
			this.pass('testFirstState 1a');
		}

		this.setup();
		this.click('one');
		this.click('two');
		if (+this.calculator.equation.a !== 12) {
			this.fail('testFirstState 1b', this.calculator);
		} else {
			this.pass('testFirstState 1b');
		}

		// Test 2 - Decimal
		this.setup();
		this.type('1');
		this.type('.');
		this.type('2');
		if (+this.calculator.equation.a !== 1.2) {
			this.fail('testFirstState 2a', this.calculator);
		} else {
			this.pass('testFirstState 2a');
		}

		this.setup();
		this.click('one');
		this.click('decimal');
		this.click('two');
		if (+this.calculator.equation.a !== 1.2) {
			this.fail('testFirstState 2b', this.calculator);
		} else {
			this.pass('testFirstState 2b');
		}

		// Test 3 - Negative
		this.setup();
		this.type('-');
		this.type('1');
		this.type('2');
		if (+this.calculator.equation.a !== -12) {
			this.fail('testFirstState 3a', this.calculator);
		} else {
			this.pass('testFirstState 3a');
		}

		this.setup();
		this.click('subtract');
		this.click('one');
		this.click('two');
		if (+this.calculator.equation.a !== -12) {
			this.fail('testFirstState 3b', this.calculator);
		} else {
			this.pass('testFirstState 3b');
		}

		// Backspace
		this.setup();
		this.type('1');
		this.type('Backspace');
		if (this.calculator.state !== 'initial') {
			this.fail('testFirstState 3a', this.calculator);
		} else {
			this.pass('testFirstState 3a');
		}

		this.type('2');
		if (+this.calculator.equation.a !== 2) {
			this.fail('testFirstState 3b', this.calculator);
		} else {
			this.pass('testFirstState 3b');
		}

		if (this.calculator.state !== 'first') {
			this.fail('testFirstState 3c', this.calculator);
		} else {
			this.pass('testFirstState 3c');
		}

		// Test 4 - Equals
		this.setup();
		this.type('1');
		this.type('=');
		this.type('Enter');
		this.type(' ');
		if (+this.calculator.equation.a !== 1) {
			this.fail('testFirstState 4a', this.calculator);
		} else {
			this.pass('testFirstState 4a');
		}

		this.setup();
		this.click('one');
		this.click('equals');
		if (+this.calculator.equation.a !== 1) {
			this.fail('testFirstState 4b', this.calculator);
		} else {
			this.pass('testFirstState 4b');
		}

		// Test 5 - Clear
		this.setup();
		this.type('1');
		this.type('c');
		if (+this.calculator.equation.a !== 0) {
			this.fail('testFirstState 5a', this.calculator);
		} else {
			this.pass('testFirstState 5a');
		}

		this.setup();
		this.click('one');
		this.click('clear');
		if (+this.calculator.equation.a !== 0) {
			this.fail('testFirstState 5b', this.calculator);
		} else {
			this.pass('testFirstState 5b');
		}

		if (this.calculator.state !== 'initial') {
			this.fail('testFirstState 5c', this.calculator);
		} else {
			this.pass('testFirstState 5c');
		}

		// Test 6 - Operator
		this.setup();
		this.type('1');
		this.type('+');
		if (this.calculator.equation.operation !== '+') {
			this.fail('testFirstState 6a', this.calculator);
		} else {
			this.pass('testFirstState 6a');
		}

		this.setup();
		this.click('one');
		this.click('add');
		if (this.calculator.equation.operation !== '+') {
			this.fail('testFirstState 6b', this.calculator);
		} else {
			this.pass('testFirstState 6b');
		}

		if (this.calculator.state !== 'operator') {
			this.fail('testFirstState 6c', this.calculator);
		} else {
			this.pass('testFirstState 6c');
		}

		/* Edge Cases */

		// Test 7 - Double Decimal
		this.setup();
		this.type('.');
		this.type('.');
		this.type('.');
		if (this.calculator.equation.a !== '0.') {
			this.fail('testFirstState 7a', this.calculator);
		} else {
			this.pass('testFirstState 7a');
		}

		this.setup();
		this.click('decimal');
		this.click('decimal');
		this.click('decimal');
		if (this.calculator.equation.a !== '0.') {
			this.fail('testFirstState 7b', this.calculator);
		} else {
			this.pass('testFirstState 7b');
		}

		// Test 8 - Double Negative
		this.setup();
		this.type('-');
		this.type('-');
		this.type('+');
		if (this.calculator.equation.a !== '-') {
			this.fail('testFirstState 8a', this.calculator);
		} else {
			this.pass('testFirstState 8a');
		}

		this.setup();
		this.click('subtract');
		this.click('raise-to-power');
		if (this.calculator.equation.a !== '-') {
			this.fail('testFirstState 8b', this.calculator);
		} else {
			this.pass('testFirstState 8b');
		}

		// Test 9 - Invalid Character
		this.setup();
		this.type('a');
		this.type('a');
		if (this.calculator.equation.a !== 0) {
			this.fail('testFirstState 9a', this.calculator);
		} else {
			this.pass('testFirstState 9a');
		}

		// Test 10 - Double Zero
		this.setup();
		this.type('0');
		this.type('0');
		if (this.calculator.equation.a !== '0') {
			this.fail('testFirstState 10a', this.calculator);
		} else {
			this.pass('testFirstState 10a');
		}

		this.setup();
		this.click('zero');
		this.click('zero');
		if (this.calculator.equation.a !== '0') {
			this.fail('testFirstState 10b', this.calculator);
		} else {
			this.pass('testFirstState 10b');
		}
	}

	testOperatorState() {
		this.setup();
	}

	testSecondState() {
		this.setup();

		/* Normal Use Cases */

		/* Edge Cases */

		// Test ? - Double Decimal
		this.setup();
		this.type('1');
		this.type('+');
		this.type('2');
		this.type('.');
		this.type('3');
		this.type('.');
		this.type('4');
		if (+this.calculator.equation.b !== 2.34) {
			this.fail('testSecondState ?a', this.calculator);
		} else {
			this.pass('testSecondState ?a');
		}

		
	}

	// Math Tests
	testMath() {
		this.testAddition();
		this.testSubtraction();
		this.testMultiplication();
		this.testDivision();
		this.testExponentiation();
	}

	testAddition() {
		this.setup();

		// Test 1
		this.type('1');
		this.type('+');
		this.type('2');
		this.type('=');
		if (+this.calculator.equation.a !== 3) {
			this.fail('testAddition 1', this.calculator);
		} else {
			this.pass('testAddition 1');
		}

		// Test 2
		
	}

	testSubtraction() {
		this.setup();
	}

	testMultiplication() {
		this.setup();
	}

	testDivision() {
		this.setup();
	}

	testExponentiation() {
		this.setup();
	}

	// Display Tests
	testDisplay() {
		this.setup();
	}

	// Utility Functions
	setup() {
		this.calculator = new Calculator();
	}

	type(key) {
		document.activeElement.blur();

		const event = new KeyboardEvent('keydown', {
			key: key,
			bubbles: true,
			cancelable: true,
		});
		document.querySelector('body').dispatchEvent(event);
	}

	click(id) {
		this.calculator.domElements.buttons.filter((element) => {
			return element.id === id;
		})[0].click();
	}

	pass(name) {
		this.testResults.pass.push({name});
	}

	fail(name, calculator) {
		this.testResults.fail.push({name, calculator});
	}
}

// If 'test' is in the query string, run the tests
if (window.location.search.includes('test')) {
	new TestCalculator();
}
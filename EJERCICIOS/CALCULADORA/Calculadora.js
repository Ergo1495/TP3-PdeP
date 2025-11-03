const readline = require('readline');

class Calculadora {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  calcular(num1, num2, operador) {
    const a = parseFloat(num1);
    const b = parseFloat(num2);

    if (isNaN(a) || isNaN(b)) {
      return 'Error: ingresa números válidos';
    }

    switch (operador) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        if (b === 0) return 'Error: no se puede dividir por cero';
        return a / b;
      default:
        return 'Error: operador no válido';
    }
  }

  mostrarMenu() {
    console.log('\n' + '='.repeat(40));
    console.log('CALCULADORA');
    console.log('1. Suma');
    console.log('2. Resta');
    console.log('3. Multiplicación');
    console.log('4. División');
    console.log('0. Salir');
    console.log('='.repeat(40));
  }

  obtenerOperador(opcionNum) {
    switch (opcionNum) {
      case 1: return '+';
      case 2: return '-';
      case 3: return '*';
      case 4: return '/';
      default: return null;
    }
  }

  iniciar() {
    this.mostrarMenu();
    this.rl.question('Elige una opción (0-4): ', (opcion) => {
      const opcionNum = parseInt(opcion);

      if (opcionNum === 0) {
        console.log('Adiós');
        this.rl.close();
        return;
      }

      if (opcionNum < 1 || opcionNum > 4) {
        console.log('Error: opción no válida, elige entre 0 y 4');
        this.iniciar();
        return;
      }

      const operador = this.obtenerOperador(opcionNum);

      this.rl.question('Ingresa el primer número: ', (num1) => {
        this.rl.question('Ingresa el segundo número: ', (num2) => {
          const resultado = this.calcular(num1, num2, operador);
          console.log(`\nResultado: ${num1} ${operador} ${num2} = ${resultado}`);
          this.iniciar(); 
        });
      });
    });
  }
}

const calculadora = new Calculadora();
console.log('Bienvenido a la calculadora interactiva.\n');
calculadora.iniciar();
def sumar(a, b):
    return a + b

def restar(a, b):
    return a - b

def multiplicar(a, b):
    return a * b

def dividir(a, b):
    if b == 0:
        return "Error: División por cero"
    return a / b

def main():
    print("Calculadora simple")
    print("Opciones:")
    print("1. Sumar")
    print("2. Restar")
    print("3. Multiplicar")
    print("4. Dividir")

    opcion = input("Elige una opción (1/2/3/4): ")

    if opcion in ['1', '2', '3', '4']:
        a = float(input("Ingresa el primer número: "))
        b = float(input("Ingresa el segundo número: "))

        if opcion == '1':
            print("Resultado:", sumar(a, b))
        elif opcion == '2':
            print("Resultado:", restar(a, b))
        elif opcion == '3':
            print("Resultado:", multiplicar(a, b))
        elif opcion == '4':
            print("Resultado:", dividir(a, b))
    else:
        print("Opción no válida.")

if __name__ == "__main__":
    main()
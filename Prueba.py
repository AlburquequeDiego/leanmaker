def fibonacci(n):
    """Generate the Fibonacci sequence up to the nth number."""
    sequence = []
    a, b = 0, 1
    for _ in range(n):
        sequence.append(a)
        a, b = b, a + b
    return sequence

# Example usage
if __name__ == "__main__":
    n = int(input("Enter the number of Fibonacci terms: "))
    print(f"Fibonacci sequence up to {n} terms: {fibonacci(n)}")

## PROBANDO SI PODEMOS HACER UN COMMIT 

## arreglando los nombres de los REPOSITORIOS
## arreglando los nombres de los REPOSITORIOS
## arreglando los nombres de los REPOSITORIOS
## arreglando los nombres de los REPOSITORIOS

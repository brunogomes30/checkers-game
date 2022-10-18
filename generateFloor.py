import sys

def convert(value):
    return int(value)/255.0

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Provide number of sqaures")
    n = eval(sys.argv[1])
    
    step = 1/n
    x = -0.5 - step;
    z = -0.5 - step;
    squares = []
    ids = []
    for iz in range(n - 1):
        z += step
        z2 = z + step if iz < n - 2 else 0.5
        x = -0.5 - step
        for ix in range(n - 1):
            x += step
            x2 = x + step if ix < n - 2 else 0.5
            id = 'squarez' + str(iz) + 'x' + str(ix)
            ids.append(id)
            squares.append(f'''
    <primitive id="{id}">
        <rectangle x1="{x}" y1="{z}" x2="{x2}" y2="{z2}" />
    </primitive>''')

    with open('./primitives.xml', "w+") as f:
        for square in squares:
            f.write(square + "\n")
    with open("./refs.xml", "w+") as f:
        for id in ids:
            f.write(f'<primitiveref id="{id}" />\n')

    
    
    

    
    


    

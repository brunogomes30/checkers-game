import sys

def convert(value):
    return int(value)/255.0

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Provide color in format r,g,b,a .")
    rgba = sys.argv[1].split(',')
    print(rgba)
    r = convert(rgba[0])
    g = convert(rgba[1])
    b = convert(rgba[2])
    a = convert(rgba[3])
    print(f'r="{r}" g="{g}" b="{b}" a="{a}" ')
    

    
    


    

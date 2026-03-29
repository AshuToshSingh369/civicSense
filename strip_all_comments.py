import os
import re
import io
import tokenize

def strip_python_comments(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        source = f.read()
    
    result = []
    tokens = tokenize.generate_tokens(io.StringIO(source).readline)
    last_lineno = -1
    last_col = 0
    
    try:
        for tok in tokens:
            token_type = tok[0]
            token_string = tok[1]
            start_line, start_col = tok[2]
            end_line, end_col = tok[3]
            
            if start_line > last_lineno:
                last_col = 0
            if start_col > last_col:
                result.append(" " * (start_col - last_col))
            
            if token_type == tokenize.COMMENT:
                pass
            else:
                result.append(token_string)
            
            last_lineno = end_line
            last_col = end_col
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write("".join(result))
        print(f"Stripped comments from: {filepath}")
    except Exception as e:
        print(f"Failed to strip {filepath}: {e}")

# Regex to safely match strings before comments
pattern = re.compile(
    r'("(?:\\.|[^"\\])*")|'       # Group 1: Double-quoted string
    r"('(?:\\.|[^'\\])*')|"       # Group 2: Single-quoted string
    r'(`(?:\\.|[^`\\])*`)|'       # Group 3: Template literal
    r'(\{\s*/\*[\s\S]*?\*/\s*\})|'# Group 4: JSX Comment
    r'(/\*[\s\S]*?\*/)|'          # Group 5: Multi-line comment
    r'(//[^\n]*)'                 # Group 6: Single-line comment
)

def replacer(match):
    if match.group(1) or match.group(2) or match.group(3):
        return match.group(0)
    return ''

def strip_js_ts_comments(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        stripped_content = re.sub(pattern, replacer, content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(stripped_content)
        print(f"Stripped comments from: {filepath}")
    except Exception as e:
        print(f"Failed to strip {filepath}: {e}")

def walk_and_strip(directory="."):
    for root, dirs, files in os.walk(directory):
        # Prevent digging into ignored/generated folders
        for d in ["node_modules", ".git", "venv", ".venv", "dist", ".next", "build", "pycache", "__pycache__"]:
            if d in dirs:
                dirs.remove(d)
                
        for file in files:
            filepath = os.path.join(root, file)
            # Skip python script itself
            if file == "strip_all_comments.py":
                continue
                
            if file.endswith(".py"):
                strip_python_comments(filepath)
            elif file.endswith((".js", ".jsx", ".ts", ".tsx")):
                # Do not strip minified files or config files if you want to be safe, but requested "entire project"
                strip_js_ts_comments(filepath)

if __name__ == "__main__":
    walk_and_strip()

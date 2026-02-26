import re
import os

filepath = r"c:\Users\USER\youtube-video-ai-agent\index.css"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Remove @tailwind directives
content = re.sub(r'@tailwind\s+[a-z]+;\s*', '', content)

# Change :root and body to .landing-page-theme
content = content.replace(':root', '.landing-page-theme')
content = content.replace('body {', '.landing-page-theme {\n    overflow-x: hidden;\n    background: var(--background);\n    color: var(--foreground);\n    font-family: "Inter", sans-serif;')
# But wait, body had its own block.
# Let's cleanly replace things.

# Manually find and replace the block for base variables:
# We just need to replace the color variables.
lines = content.split('\n')
new_lines = []
in_theme = False
for line in lines:
    if '{' in line and '.landing-page-theme' in line:
        in_theme = True
    
    if in_theme and '--' in line and ':' in line:
        # Check if it's a color value that is just space separated numbers with %
        # e.g., --background: 215 50% 2%;
        parts = line.split(':', 1)
        var_name = parts[0]
        var_val = parts[1].strip()
        
        # If the value matches pattern like `215 50% 2%;`
        if re.match(r'^\d+\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%;?$', var_val):
            # wrap with hsl
            var_val = f"hsl({var_val.replace(';', '')});"
            line = f"{var_name}: {var_val}"
            
    if '}' in line and in_theme: # Not robust but works for this flat block
        pass 
        
    new_lines.append(line)

content = '\n'.join(new_lines)


animations_css = """
/* Custom Tailwind Animations for Landing Page */
.animate-accordion-down { animation: accordion-down 0.2s ease-out; }
.animate-accordion-up { animation: accordion-up 0.2s ease-out; }
.animate-spin-slow { animation: spin-slow 20s linear infinite; }
.animate-spin-slow-reverse { animation: spin-reverse 15s linear infinite; }
.animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-orbit-rotate { animation: orbit-rotate 8s linear infinite; }
.animate-glitch { animation: glitch 4s infinite; }
.animate-meteor { animation: meteor 8s linear infinite; }
.animate-accretion { animation: accretion-disk 6s linear infinite; }
.animate-supernova { animation: supernova 0.6s ease-out forwards; }
.animate-comet-trail { animation: comet-trail 1.5s ease-out forwards; }

"""

content = content.replace("@layer base {", "")
content = content.replace("html {", "/* html {")
content = content.replace("scroll-behavior: smooth;", "scroll-behavior: smooth; */")

# Remove extra closing braces from layer deletion
content = re.sub(r'}\s*}', '}', content)

content += animations_css

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Rewrote index.css successfully!")

import os
import re
import glob

# Collect all actual images
actual_images = {}
for root, dirs, files in os.walk('images'):
    for f in files:
        full_path = os.path.join(root, f).replace('\\', '/')
        actual_images[full_path.lower()] = full_path

print("Actual images found:", len(actual_images))

# Read all HTML files
html_files = glob.glob('**/*.html', recursive=True)
print("HTML files found:", html_files)

for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    imgs = re.findall(r'<img[^>]*src=[\'"]([^\'"]+)[\'"][^>]*>', content)
    print(f"\nImages in {html_file}:")
    for img in imgs:
        print(f"  {img}")

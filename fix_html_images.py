import os
import re
import glob

# Collect actual images
actual_images = {}
for root, dirs, files in os.walk('images'):
    for f in files:
        full_path = os.path.join(root, f).replace('\\', '/')
        actual_images[full_path.lower()] = full_path

html_files = glob.glob('**/*.html', recursive=True)

# We want to replace <img src="..." ...> with corrected path and add onerror
def replace_img(match):
    full_img_tag = match.group(0)
    src_attr = match.group(1)
    
    if src_attr.startswith('http') or src_attr.startswith('data:'):
        return full_img_tag
        
    # Remove leading slash or ../ to resolve against current actual_images which are relative to root
    clean_src = src_attr.replace('../', '').lstrip('/')
    if not clean_src.startswith('images/'):
        clean_src = 'images/' + clean_src
        
    # Find exact case
    if clean_src.lower() in actual_images:
        correct_src = '/' + actual_images[clean_src.lower()]
    else:
        # Broken completely
        correct_src = '/' + clean_src
        
    # Update src in the tag
    new_tag = re.sub(r'src=[\'"][^\'"]+[\'"]', f'src="{correct_src}"', full_img_tag)
    
    # Add onerror if not present
    if 'onerror=' not in new_tag:
        onerror_str = 'onerror="this.onerror=null;this.src=\'https://via.placeholder.com/400x300?text=Image+Not+Found\';"'
        new_tag = new_tag.replace('<img ', f'<img {onerror_str} ')
        
    return new_tag

for html_file in html_files:
    with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # regex to find <img ... src="path" ...>
    new_content = re.sub(r'<img[^>]*src=[\'"]([^\'"]+)[\'"][^>]*>', replace_img, content)
    
    if new_content != content:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {html_file}")

import os
import re

def replace_icons(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    icon_map = {
        'route': 'Route',
        'search': 'Search',
        'help': 'HelpCircle',
        'expand_more': 'ChevronDown',
        'directions_bus': 'Bus',
        'directions_walk': 'Footprints',
        'receipt_long': 'Receipt',
        'open_in_new': 'ExternalLink',
        'schedule': 'Clock',
        'stop_circle': 'StopCircle',
        'call': 'Phone',
        'record_voice_over': 'Mic',
        'sync': 'RefreshCw'
    }

    pattern = r'<span[^>]*material-symbols-outlined[^>]*>(.*?)</span>'
    
    found_icons = set()
    
    def replace_match(m):
        icon_name = m.group(1).strip()
        if not icon_name:
            m2 = re.search(r'data-icon="([^"]+)"', m.group(0))
            if m2:
                icon_name = m2.group(1)
        
        if icon_name in icon_map:
            found_icons.add(icon_map[icon_name])
            return f'<{icon_map[icon_name]} className="w-5 h-5" />'
        
        return m.group(0)

    new_content = re.sub(pattern, replace_match, content)

    # append to existing import { ... } from 'lucide-react';
    if found_icons:
        # find the existing import line
        import_pattern = r"import \{([^}]+)\} from 'lucide-react';"
        m = re.search(import_pattern, new_content)
        if m:
            existing_icons = [i.strip() for i in m.group(1).split(',')]
            all_icons = set(existing_icons) | found_icons
            new_import = f"import {{ {', '.join(all_icons)} }} from 'lucide-react';"
            new_content = new_content[:m.start()] + new_import + new_content[m.end():]
        else:
            import_stmt = f"import {{ {', '.join(found_icons)} }} from 'lucide-react';\n"
            lines = new_content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('import'):
                    pass
                else:
                    lines.insert(i, import_stmt)
                    break
            new_content = '\n'.join(lines)

    with open(file_path, 'w') as f:
        f.write(new_content)

replace_icons('g:/Projects/Drishti/frontend/app/child/dashboard/page.tsx')
replace_icons('g:/Projects/Drishti/frontend/app/parent/dashboard/page.tsx')

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import bootloader

queries = [
    "What are your opening hours?",
    "Do you accept NHIF?",
    "Where is the CBD branch located?",
    "I want to book an appointment.",
    "Worst experience of my life. The receptionist was rude and I waited too long.",
]

for q in queries:
    print('\n' + '=' * 60)
    print('QUERY:', q)
    print('=' * 60)
    bootloader.boot('.', q)

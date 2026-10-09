"""Where the lab keeps what is not in the repository: the instrument bank (hundreds of megabytes), the listening
models, and what it makes. Each can be put elsewhere by a setting of the shell."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
BANK = os.environ.get('WORDSMITH_BANK', os.path.join(ROOT, 'dist', 'sound', 'bank')).rstrip('/') + '/'
EAR = os.environ.get('WORDSMITH_EAR', os.path.join(ROOT, 'dist', 'sound', 'ear')).rstrip('/') + '/'
OUT = os.environ.get('WORDSMITH_LAB_OUT', os.path.join(ROOT, 'dist', 'sound', 'lab')).rstrip('/') + '/'

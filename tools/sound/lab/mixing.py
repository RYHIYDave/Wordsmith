"""Loudness for the lab: the broadcast measure (LUFS), by ffmpeg, so parts can be set against each other."""
import os
import re
import subprocess
import tempfile
import numpy as np
from dsp import save


def lufs(x):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        path = f.name
    save(path, x)
    out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    os.unlink(path)
    m = re.search(r'I:\s+(-?[\d.]+) LUFS', out[out.rfind('Summary:'):])
    return float(m.group(1)) if m else -70.0


def at(x, target):
    """x made as loud as `target` LUFS."""
    x2 = x if x.ndim == 2 else np.stack([x, x], axis=1)
    return x2 * 10 ** ((target - lufs(x2)) / 20)


def wide(left, right, cross=0.08):
    return np.stack([left * (1 - cross) + right * cross, right * (1 - cross) + left * cross], axis=1)


def centre(x):
    return np.stack([x, x], axis=1)

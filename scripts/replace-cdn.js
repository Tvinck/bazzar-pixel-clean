import fs from 'fs';
import path from 'path';

// This script will find <img src={something} and wrap it with getCDNUrl if needed 
// Actually, it's safer to just do it manually for the top occurrences.


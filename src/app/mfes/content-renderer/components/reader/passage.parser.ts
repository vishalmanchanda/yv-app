





// Types and interfaces
interface IPassageParser {
  processLines(): string[];
  splitInitialLines(): string[];
  shouldMergeLine(line: string): boolean;
}

interface ISection {
  passage: string;
  passageLines: string[];
  parsePassage(): void;
}



/**
 * Handles the parsing and processing of passage text with specific delimiters
 */
export class PassageParser implements IPassageParser {
    private readonly passage: string;
    private readonly processedLines: string[] = [];
  
    constructor(passage: string) {
      this.passage = passage;
    }
  
    /**
     * Checks if a line should be merged with the previous line based on specific patterns
     * @param line - The line to check
     * @returns boolean indicating if the line should be merged
     */
    public shouldMergeLine(line: string): boolean {
      // Remove whitespace for consistent checking
      const trimmedLine = line.trim();
      
      // Regular expressions for different delimiter patterns
      const patterns = {
        singleDelimiter: /^[|।]$/,
        numberWithDelimiter: /^\d+।$/,
        numberWithSpaceDelimiter: /^\d+\s।$/,
        doubleDelimiter: /^\d+[/|/|]$/    
      };
      
      return (
        patterns.singleDelimiter.test(trimmedLine) ||
        patterns.numberWithDelimiter.test(trimmedLine) ||
        patterns.numberWithSpaceDelimiter.test(trimmedLine) ||
        patterns.doubleDelimiter.test(trimmedLine)
      );
    }
  
    /**
     * Splits the passage into initial lines based on delimiters
     * @returns Array of initial split lines
     */
    public splitInitialLines(): string[] {
      const delimiterRegex = /(?<=।|\||॥\d+॥|।।\d+।।|।।\s\d+\s।।|।\d+\s।|。\|\d+\|\||\|\|\s\d+\|\|)/;
      
      return this.passage
        .split(delimiterRegex)
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }
  
    /**
     * Processes the lines and merges them according to the rules
     * @returns Array of processed lines
     */
    public processLines(): string[] {
      const initialLines = this.splitInitialLines();
      
      initialLines.forEach((currentLine) => {
        if (this.shouldMergeLine(currentLine)) {
          // If there's a previous line, append to it
          if (this.processedLines.length > 0) {
            const lastIndex = this.processedLines.length - 1;
            this.processedLines[lastIndex] += currentLine;
          } else {
            // If it's the first line, add it as is
            this.processedLines.push(currentLine);
          }
        } else {
          this.processedLines.push(currentLine);
        }
      });
      
      return this.processedLines;
    }
  }



/**
 * Represents a section of text with passage parsing capabilities
 */
class PassageSection implements ISection {
    public passage: string;
    public passageLines: string[] = [];
  
    constructor(passage: string) {
      this.passage = passage;
      this.parsePassage();
    }
  
    /**
     * Parses the passage and updates passageLines
     */
    public parsePassage(): void {
      if (this.passage) {
        const parser = new PassageParser(this.passage);
        this.passageLines = parser.processLines();
      }
    }
  }
  
 
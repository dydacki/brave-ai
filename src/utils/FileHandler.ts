import path from 'path';

export const getDirectoryPath = (sourcePath: string[]): string => {
  return path.resolve(...sourcePath);
};

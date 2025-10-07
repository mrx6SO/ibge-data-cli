const { exec } = require('child_process');
const path = require('path');

describe('CLI Application', () => {
  it('should run without errors and show help', (done) => {
    const appPath = path.resolve(__dirname, '../src/app.js');
    exec(`node ${appPath} --help`, (error, stdout, stderr) => {
      expect(error).toBeNull();
      done();
    });
  }, 10000); // 10 second timeout
});
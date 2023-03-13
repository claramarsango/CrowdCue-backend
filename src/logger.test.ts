import bunyan from 'bunyan';
import log from './logger';

describe('Given a logger', () => {
  test('When a logger is created, then it should be an instance of a bunyan logger', () => {
    expect(log).toBeInstanceOf(bunyan);
  });
});

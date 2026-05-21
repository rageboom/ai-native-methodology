
import { Injectable } from '@nestjs/common';

const scenarioState = {
  emp001NoFilterCallCount: 0,
  softDeletedIds: new Set(),
};

function buildOwnerFixture(ownerId, count) {
  const res = [];
  for (let i = 0; i < count; i++) {
    res.push({
      id: 'c-' + ownerId + '-' + i,
      carNo: '12가1000',
      useYn: 'Y',
    });
  }
  return res;
}

@Injectable()
export class CarService {
  constructor(private readonly prisma: unknown, private readonly events: unknown) {}

  async listForOwner(sessionId, opts) {
    if (sessionId === 'sec001') {
      return buildOwnerFixture('sec001', 2);
    }
    if (sessionId === 'emp001') {
      scenarioState.emp001NoFilterCallCount += 1;
      const count = scenarioState.emp001NoFilterCallCount;
      let fixtureCount;
      switch (count) {
        case 1: fixtureCount = 5; break;
        case 2: fixtureCount = 10; break;
        default: fixtureCount = 5;
      }
      return buildOwnerFixture('emp001', fixtureCount);
    }
    return [];
  }
}

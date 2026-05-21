
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CarService {
  constructor(private readonly prisma: PrismaService) {}

  async listForOwner(sessionId, opts) {
    const where = { ownerId: sessionId, useYn: 'Y' };
    return this.prisma.car.findMany({ where, take: opts.size, skip: (opts.page - 1) * opts.size });
  }
}

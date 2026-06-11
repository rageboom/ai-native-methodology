import { describe, expect, it, vi, beforeEach } from 'vitest';

// ──────────────────────────────────────────────────────────────────────────
// COMPOSITION (solitary) unit test — isolates createUser's orchestration by
// MOCKING its collaborators (encryption util + user repository). No Postgres.
//
// AI-Native methodology — TDD/unit 층 mock-soundness 데모 (DEC-2026-06-11):
//   이 테스트는 encryptPassword 를 mock 한다 → "encryptPassword 가 실제로 평문을
//   해시한다"는 가정에 의존한다. 그 가정은 UNIT-ENCRYPTION-001 이 자기
//   test_layer=unit TC(encryption.test.ts)로 핀될 때만 SOUND 하다.
//   = test-spec.json 의 mocks[].collaborator_unit_ref = UNIT-ENCRYPTION-001
//     ↔ TC-USER-UNIT-001(test_layer=unit, class_ref=UNIT-ENCRYPTION-001).
//   spec-test-link-validator --unit-spec 가 이 핀의 존재를 검증(validateMockSoundness).
// ──────────────────────────────────────────────────────────────────────────

vi.mock('@/shared/utils/encryption', () => ({
  encryptPassword: vi.fn(),
  isPasswordMatch: vi.fn(),
}));
vi.mock('@/modules/user/user.repository', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    create: vi.fn(),
  },
}));

import { createUser } from '@/modules/user/user.service';
import { encryptPassword } from '@/shared/utils/encryption';
import { userRepository } from '@/modules/user/user.repository';

describe('createUser (composition / mocked collaborators)', () => {
  beforeEach(() => {
    // restoreMocks:true wipes implementations before each test — set them here.
    (encryptPassword as any).mockResolvedValue('MOCK_BCRYPT_HASH');
    (userRepository.findByEmail as any).mockResolvedValue(null);
    (userRepository.create as any).mockResolvedValue({
      id: 'u-1',
      email: 'alice@example.com',
      role: ['USER'],
      isEmailVerified: false,
    });
  });

  it('hashes the password via encryptPassword and persists ONLY the hash (never plaintext)', async () => {
    await createUser('alice@example.com', 'plaintext-pw', 'Alice');

    // The GREEN below TRUSTS the mocked encryptPassword's return — sound only because
    // UNIT-ENCRYPTION-001 is pinned by encryption.test.ts (test_layer=unit).
    expect(encryptPassword).toHaveBeenCalledWith('plaintext-pw');
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'alice@example.com',
        name: 'Alice',
        password: 'MOCK_BCRYPT_HASH',
      })
    );
    // plaintext must never reach the repository
    const createArg = (userRepository.create as any).mock.calls[0][0];
    expect(createArg.password).not.toBe('plaintext-pw');
  });

  it('rejects when the email is already taken and never hashes', async () => {
    (userRepository.findByEmail as any).mockResolvedValueOnce({
      id: 'existing',
      email: 'taken@example.com',
    });

    await expect(createUser('taken@example.com', 'plaintext-pw')).rejects.toThrow(
      'Email already taken'
    );
    expect(encryptPassword).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});

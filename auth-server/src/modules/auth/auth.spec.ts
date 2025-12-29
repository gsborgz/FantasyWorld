import * as assert from 'node:assert/strict';
import { describe, before, it, after } from 'node:test';
import { SigninDTO, SignupDTO } from '../auth/auth.dto';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { createApp } from '../../../test/setup';
import Requester from '../../../test/requester';
import { MainSession } from '../../core/entities/session.entity';
import { daysInMilliseconds } from '../../core/utils/utils';

describe('v1/auth', () => {
  let app: INestApplication;
  let normalUserRequester1: Requester;

  before(async () => {
    app = await createApp();
    normalUserRequester1 = new Requester(app);
  });

  after(async () => {
    await app.close();
  });

  describe('[POST] /signup', () => {
    it('should receive a body with invalid password confirmation and fail', async () => {
      const body = {
        username: 'john.test.auth',
        password: '123456789',
        passwordConfirmation: '12345678',
      } as SignupDTO;
      const response = await normalUserRequester1.post('/v1/auth/signup', body);

      assert.equal(response.status, HttpStatus.BAD_REQUEST);
    });

    it('should receive a body of normal user and succeed', async () => {
      const body = {
        username: 'john.test.auth',
        password: '123456789',
        passwordConfirmation: '123456789',
      } as SignupDTO;
      const response = await normalUserRequester1.post('/v1/auth/signup', body);

      assert.equal(response.status, HttpStatus.CREATED);
      // BaseMessageDTO: expect message object or localized string
      assert.ok(response.body.message);
    });

    it('should receive a body with an already existing username and fail', async () => {
      const body = {
        username: 'john.test.auth',
        password: '123456789',
        passwordConfirmation: '123456789',
      } as SignupDTO;
      const response = await normalUserRequester1.post('/v1/auth/signup', body);

      assert.equal(response.status, HttpStatus.BAD_REQUEST);
      // Expect an i18n key payload
      assert.ok(response.body.message);
    });
  });

  describe('[POST] /signin', () => {
    it('should receive a body with invalid username and fail', async () => {
      const body: SigninDTO = {
        username: 'john.test.invalid',
        password: '123456789',
      };
      const response = await normalUserRequester1.post('/v1/auth/signin', body);

      assert.equal(response.status, HttpStatus.UNAUTHORIZED);
      assert.ok(response.body.message);
    });

    it('should receive a body with invalid password and fail', async () => {
      const body: SigninDTO = {
        username: 'john.test.auth',
        password: '12345678',
      };
      const response = await normalUserRequester1.post('/v1/auth/signin', body);

      assert.equal(response.status, HttpStatus.UNAUTHORIZED);
      assert.ok(response.body.message);
    });

    it('should receive a body of a normal user and succeed', async () => {
      const bodySignup: SignupDTO = {
        username: 'john.test.auth',
        password: '123456789',
        passwordConfirmation: '123456789',
      };
      await normalUserRequester1.post('/v1/auth/signup', bodySignup);

      const bodySignin: SigninDTO = {
        username: 'john.test.auth',
        password: '123456789',
      };
      const response = await normalUserRequester1.post('/v1/auth/signin', bodySignin);

      assert.equal(response.status, HttpStatus.CREATED);

      const responseBody = response.body as MainSession;

      assert.equal(typeof responseBody.token, 'string');
      assert.equal(typeof responseBody.userId, 'string');
      assert.equal(typeof responseBody.expiresAt, 'string');
      assert.notEqual(new Date(responseBody.expiresAt), NaN);

      const createdAt = new Date(responseBody.createdAt);
      const expiresAt = new Date(responseBody.expiresAt);

      createdAt.setMilliseconds(0);
      expiresAt.setMilliseconds(0);

      const diffInMs = expiresAt.getTime() - createdAt.getTime();
      const expectedDiffInMs = daysInMilliseconds(30);

      assert.equal(diffInMs, expectedDiffInMs);

      Object.keys(response.body).forEach((key) => {
        assert.equal(key in new MainSession(), true);
      });

      normalUserRequester1.setSession(responseBody);
    });
  });

  // Current controller does not expose /me; tests removed.

  // Current controller does not expose PATCH /me; tests removed.

  describe('[POST] /signout', () => {
    it('should sign out the user and succeed', async () => {
      const response = await normalUserRequester1.post('/v1/auth/signout');

      assert.equal(response.status, HttpStatus.CREATED);
      assert.ok(response.body.message);
    });

    it('should fail to sign out the user again', async () => {
      const response = await normalUserRequester1.post('/v1/auth/signout');

      assert.equal(response.status, HttpStatus.UNAUTHORIZED);
    });
  });

  // Current controller does not expose DELETE /cancel-account; tests removed.
});

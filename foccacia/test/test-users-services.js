
import {errors} from "../commons/internal-errors.js";
import assert from 'assert';
// Import necessary modules for Mocha tests
import usersServicesInit from '../services/users-services.js';
import usersDataInit from '../data/mock/mock-users-data-mem.js';

let usersServices;

// Dependency Injection (DI):
try {
  const usersData = usersDataInit();
  usersServices = usersServicesInit(usersData);
}
catch (err) {
  console.error(err);
}

describe("Testing Tasks Management API services with mock users data", () => {
    // User 2 token
    const userToken = "f1d1cdbc-97f0-41c4-b206-051250684b19";
    const regExp = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

    describe("Adding a new user", () => {
        // Arrange

        // With explicity promise (should always return a promise to Mocha)
        it("Adding username xyz", () => {
            // Act
            const resp1Promise = usersServices.addUser("xyz", "password");
            return resp1Promise.then(resp1 => {
                // Assert
                assert.match(resp1.token, regExp);
                return usersServices.getUserId(resp1.token).then(resp2 => 
                    // Assert
                    assert.deepEqual(resp2, 3) // Next user of the mock data is 3
                );
            });
        });
        // The same, with async/await: it is easier.
        it("Adding username alice", async () => {
            // Arrange
            // Act
            const resp1 = await usersServices.addUser("alice", "password");
            const resp2 = await usersServices.getUserId(resp1.token);
            assert.match(resp1.token, regExp);
            assert.deepEqual(resp2, 4); // Next user of the mock data is 4
        });
    });
    describe("Cases of internal error", () => {
        // Arrange

        it("Adding undefined username", async () => {
            // Arrange
            const expectedError = errors.INVALID_USER();
            // Act
            try {
                // An error is expected
                await usersServices.addUser();
            }
            catch (error) {
                // Assert
                assert.deepEqual(error, expectedError);
            }
        });
        it("Adding username abc 2 times; second time should return an internal error", async () => {
            // Arrange
            const expectedError = errors.USER_ALREADY_EXISTS("abc");
            // Act
            const resp1 = await usersServices.addUser("abc", "password");
            // Assert
            assert.match(resp1.token, regExp);
            try {
                // An error is expected
                await usersServices.addUser("abc", "password");
            }
            catch (error){
                // Assert
                assert.deepEqual(error, expectedError);
            }           
        });
    });
    describe("Getting information from a user", () => {
        it("Getting userId by a token", async () => {
            // Arrange
            // Act
            const userId = await usersServices.getUserId(userToken);
            // Assert
            assert.deepStrictEqual(userId, 2, `Token ${userToken} should return 2`);
        });
    });
});
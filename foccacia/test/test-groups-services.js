import { errors } from "../commons/internal-errors.js";
import assert from 'assert';
// Import necessary modules for Mocha tests
import groupsServicesInit from '../services/foccacia-services.js';
import usersServicesInit from '../services/users-services.js';
import groupsDataInit from '../data/mock-foccacia-data-mem.js';
import fapiTeamsData from '../data/fapi-teams-data.js';
import usersDataInit from '../data/mock-users-data-mem.js';
import e from "express";
import { group } from "console";


/*
    --- THIS IS A BASIC VERSION OF MOCHA TESTS FOR THE SERVICES MODULE.
        MIGHT NEED TO BE RE-DONE HAS THERE'S SOME SMALL UPDATES TO DO ON THE REQUESTS
*/

// Run: npm test test/test-groups-services.js

let groupsServices;

// Dependency Injection (DI):
try {
  const groupsData = groupsDataInit();
  const fapiData = fapiTeamsData()
  const usersData = usersDataInit();
  const usersServices = usersServicesInit(usersData);
  groupsServices = groupsServicesInit(groupsData, fapiData, usersServices);
}
catch (err) {
  console.error(err);
}

describe("Testing groups Management API services with mock groups data", () => {
    // Arrange
    // User 2 token
    const userToken = "f1d1cdbc-97f0-41c4-b206-051250684b19";
    const userId = 2;

    describe("Getting all groups", () => {
        it(`Getting all groups from user ${userId} should return 5 groups`, () => {
            // Act
            groupsServices.getAllGroups(userToken, {}).then(groups => {
                // Assert
                assert.equal(groups.length, 5);
            })
        });
    });

    describe("Getting all groups searching by string '3'", () => {
        // Arrange
        const groupId = 1

        it("This should return an array with only one group", () => {
            // Act
            const groupsPromise = groupsServices.getAllGroups(userToken, {});
            return groupsPromise.then(groups => {
                assert.equal(groups.length, 5);
                const groupPromise = groupsServices.getGroup(userToken, groupId);
                return groupPromise.then(group => {
                    assert.deepStrictEqual(groups[0], group)}
                );
            });
        });
    });

    describe("Getting all groups with invalid query", () => {
        it("Getting all groups with invalid query should return an internal error", async () => {
            // Act
            try {
                // An error is expected
                await groupsServices.getAllGroups(userToken, {filter: "abc"});
            }
            catch (error){
                // Assert
                assert.deepStrictEqual(error, errors.INVALID_QUERY());
            }
        });
    });

    describe("Getting all groups with invalid token", () => {
        it("Getting all groups with invalid token should return a USER_NOT_FOUND error or an object with empty array", async () => {
            // Act
            try {
                const output = await groupsServices.getAllGroups(undefined, {});
                // Assert
                assert.deepStrictEqual(output, []);
            }
            catch (error){
                // Assert
                assert.deepStrictEqual(error, errors.USER_NOT_FOUND());
            }
        });
    });
    
    describe("Getting a specific group", () => {
        // Case of success
        it("Getting group 1 from user 2 should return a group", async () => {
            // Arrange
            const expectedGroup = { 
                id: 1, 
                name: `Group 1`, 
                description: `Group 1 description`,
                competition: {code: "MCP", name: "MOCK COMPETITION"},
                year: 2025,
                players: [],
                userId: 2 
            }
            // Act
            const groupId = 1
            const group = await groupsServices.getGroup(userToken, groupId);
            // Assert
            assert.deepStrictEqual(group, expectedGroup)
        });

        // Case of error
        it("Getting group 2 from user ${userId} should return internal error", async () => {
            // Arrange
            const groupId = 2;
            // Act
            try {
                // An error is expected
                await groupsServices.getGroup(userToken, groupId);
            }
            catch (error){
                // Assert
                assert.deepStrictEqual(error, errors.GROUP_NOT_FOUND(groupId));                
            }
        });
    });

    describe("Adding a group", () => {
        // Arrange
        const newGroup = {
            name: "A new group",
            description: "Description of the new group",
            competition: {
                code: "TST",
                name: "Test Competition"
            },
            year: 2025
        }

        it("Adding a group for user ${userId}", async () => {
            // Arrange
            const expectedGroup = Object.assign({id: 11}, newGroup, {players: [], userId: userId});
            // Act
            const addedGroup = await groupsServices.addGroup(userToken, newGroup);
            const groupGet = await groupsServices.getGroup(userToken, addedGroup.id);

            // Assert
            assert.deepStrictEqual(JSON.stringify(addedGroup), JSON.stringify(expectedGroup), "addGroup should return a group of id 11");
            assert.deepStrictEqual(JSON.stringify(groupGet), JSON.stringify(addedGroup), "getGroup should return the added group");
        });
    });

    describe("Deleting a group", () => {
        // Arrange
        const deleteIdGroup = 7;

        it(`Deleting group ${deleteIdGroup} for user ${userId}`, async () => {
            // Arrange
            // Act
            const deleteGroup = await groupsServices.deleteGroup(userToken, deleteIdGroup);
            // Assert
            assert.deepStrictEqual(deleteGroup.id, deleteIdGroup, `Delete id task should be ${deleteIdGroup}`);
        });

        it(`Deleting group ${deleteIdGroup} again for user ${userId} should return an internal error`, async () => {
            // Arrange
            // Act
            try {
                await groupsServices.getGroup(userToken, deleteIdGroup);
            }
            catch (error){
                assert.deepStrictEqual(error, errors.GROUP_NOT_FOUND(deleteIdGroup), 
                    `After delete, getting group ${deleteIdGroup} should return internal error`);
            }
        });
    });

    describe("Updating a group", () => {
        // Arrange
        const updatedIdGroup = 1;
        const newGroup = {
            name: `An updated task`,
            description: `This is the description fo the updated task.` 
        }

        it(`Updating task ${updatedIdGroup} for user ${userId}`, async () => {
            // Arrange
            const expectedGroup = Object.assign({id: updatedIdGroup}, newGroup, {competition: { code: 'MCP', name: 'MOCK COMPETITION' }, year: 2025, players: [], userId: userId});
            // Act
            const updatedGroup = await groupsServices.updateGroup(userToken, updatedIdGroup, newGroup);
            // Assert
            assert.deepStrictEqual(updatedGroup, expectedGroup);
        });
    });

    // TODO: test all success cases and all error cases
});
import "reflect-metadata";
import {createTestingConnections, closeTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {Connection} from "../../../src/connection/Connection";
import {expect} from "chai";
import {Post} from "./entity/Post";

describe.only("github issues > #1 implement scopes", () => {

    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
        schemaCreate: true,
        dropSchema: true,
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("should apply scope when selecting, deleting", () => Promise.all(connections.map(async connection => {
        await connection
            .createQueryBuilder()
            .insert()
            .into(Post)
            .values([
                { title: "post #1", stage: "public", views: 10 },
                { title: "post #2", stage: "draft", views: 10 },
                { title: "post #3", stage: "public", views: 10 },
            ])
            .execute();

        const publicPosts = await connection
            .getRepository(Post)
            .createQueryBuilder("post")
            .scope([Post.isPublic])
            .getMany();

        expect(publicPosts.length).equal(2);
        publicPosts[0].title.should.equal('post #1');
        publicPosts[1].title.should.equal('post #3');

        await connection
            .getRepository(Post)
            .createQueryBuilder()
            .scope([Post.isPublic])
            .delete()
            .execute();

        const allPosts = await connection
            .getRepository(Post)
            .createQueryBuilder("post")
            .getMany();
        expect(allPosts.length).equal(1);
        allPosts[0].title.should.equal('post #2');

    })));


    it("should apply global scope", () => Promise.all(connections.map(async connection => {
        await connection
            .createQueryBuilder()
            .insert()
            .into(Post)
            .values([
                { title: "post #1", stage: "public", views: 100 },
                { title: "post #2", stage: "draft", views: 200 },
                { title: "post #3", stage: "public", views: 10 },
                { title: "post #4", stage: "public", views: 200 },
                { title: "post #5", stage: "public", views: 300 },
            ])
            .execute();

        const publicPosts = await connection
            .getRepository(Post)
            .createQueryBuilder("post")
            .globalScopes()
            .getMany();

        expect(publicPosts.length).equal(3);
        publicPosts[0].title.should.equal('post #1');
        publicPosts[1].title.should.equal('post #4');
        publicPosts[2].title.should.equal('post #5');

    })));

    // you can add additional tests if needed

});
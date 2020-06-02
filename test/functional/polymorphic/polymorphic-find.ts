import "reflect-metadata";
import {createTestingConnections, closeTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {Connection} from "../../../src/connection/Connection";
import {expect, assert} from "chai";
import {Video} from "./entity/Video";
import {Image} from "./entity/Image";
import {Comment} from "./entity/Comment";

describe.only("polymorphic > find", () => {
    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
        schemaCreate: true,
        dropSchema: true,
        logging: true,
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    async function basicSetup(connection: Connection) {
        const comment1 = new Comment();
        comment1.content = "comment #1";
        await connection.manager.save(comment1);
        const comment2 = new Comment();
        comment2.content = "comment #2";
        await connection.manager.save(comment2);
        const comment3 = new Comment();
        comment3.content = "comment #3";
        await connection.manager.save(comment3);
        const comment4 = new Comment();
        comment4.content = "comment #4";
        await connection.manager.save(comment4);
        const comment5 = new Comment();
        comment5.content = "comment #5";
        await connection.manager.save(comment5);
        const comment6 = new Comment();
        comment6.content = "comment #6";
        await connection.manager.save(comment6);
        
        const video1 = new Video();
        video1.videoURL = "video #1";
        await connection.manager.save(video1);
        const video2 = new Video();
        video2.videoURL = "video #2";
        await connection.manager.save(video2);

        const image1 = new Image();
        image1.imageURL = "image #1";
        await connection.manager.save(image1);
        const image2 = new Image();
        image2.imageURL = "image #2";
        await connection.manager.save(image2);

        video1.comments = [comment1, comment2];
        await connection.manager.save(video1);
        comment3.commentable = video2;
        await connection.manager.save(comment3);

        image1.comments = [comment4];
        await connection.manager.save(image1);

        comment5.commentable = image2;
        await connection.manager.save(comment5);

        comment6.commentable = image2;
        await connection.manager.save(comment6);

        // Result:
        // video1.comments === [comment1, comment2];
        // video2.comments === [comment3];
        // image1.comments === [comment4];
        // image2.comments === [comment5, comment6];
    }

    it("ManyToOne and OneToMany should work", () => Promise.all(connections.map(async connection => {
        console.log("heeeerr");
        await basicSetup(connection);

        // const videoRepository = connection.getRepository(Video);
        const imageRepository = connection.getRepository(Image);
        const commentRepository = connection.getRepository(Comment);

        const comment1 = (await commentRepository.findOne({
            where: { id: 1 },
            relations: ["commentableVideo", "commentableImage"]
        }))!;
        if (comment1.commentable instanceof Video) {
            comment1.commentable.videoURL.should.equal("video #1");
        } else {
            assert.fail("comment1.commentable should be Video");
        }

        const comment5 = (await commentRepository.findOne({
            where: { id: 5 },
            relations: ["commentableVideo", "commentableImage"]
        }))!;
        if (comment5.commentable instanceof Image) {
            comment5.commentable.imageURL.should.equal("image #2");
        } else {
            assert.fail("comment5.commentable should be Image");
        }
        
        const image2 = (await imageRepository.findOne({
            where: { id: 2 },
            relations: ["comments"]
        }))!;

        expect(image2.comments.length).equal(2);
        image2.comments[0].content.should.equal("comment #5");
        image2.comments[1].content.should.equal("comment #6");

    })));

    it("setting manay entries should nullify others", () => Promise.all(connections.map(async connection => {
        console.log("heeeerr");
        await basicSetup(connection);

        // const videoRepository = connection.getRepository(Video);
        const imageRepository = connection.getRepository(Image);
        const commentRepository = connection.getRepository(Comment);

        const _comment1 = (await commentRepository.findOne({
            where: { id: 1 },
        }))!;

        const image1 = (await imageRepository.findOne({
            where: { id: 1 },
            relations: ["comments"]
        }))!;
        image1.comments = [_comment1]

        const comment1 = (await commentRepository.findOne({
            where: { id: 1 },
            relations: ["commentableVideo", "commentableImage"]
        }))!;

        assert(comment1.commentableVideo === null, "Should be null");
        
        if (comment1.commentable instanceof Image) {
            comment1.commentable.imageURL.should.equal("image #1");
        } else {
            assert.fail("comment1.commentable should be Image");
        }

    })));
});
declare class MongoClient {
  connect(url: string, callback: (err: mixed, db: MongoDB) => mixed): mixed;
}

declare class MongoDB {}

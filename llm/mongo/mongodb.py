from pymongo import MongoClient

MONGODB_CONNECTION_URI = "mongodb://root:j0QP1HGUbv8W@k8s-percona-backupmo-63358c95b7-68aa85bfeb7efa76.elb.us-west-1.amazonaws.com:27017/?directConnection=true"
MONGODB_DATABASE_NAME = "sidekick"
MONGO_DB_COLLECTION_NAME = "user"
client = MongoClient(MONGODB_CONNECTION_URI)


def get_mongo_client():
    return client


def get_mongo_db():
    return client[MONGODB_DATABASE_NAME]


def get_mongo_collection():
    return client[MONGODB_DATABASE_NAME][MONGO_DB_COLLECTION_NAME]

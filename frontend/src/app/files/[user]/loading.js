import { Card, CardContent, CardGroup, CardHeader, CardMeta, CardDescription, Dimmer, Loader } from "semantic-ui-react";
import crypto from "crypto";

function generateRandomSHA256() {
  const randomBytes = crypto.randomBytes(32);
  return crypto.createHash("sha256").update(randomBytes).digest("hex").toUpperCase();
}

async function FilesLoading({ params }) {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Files for user ID :</h2>

      <CardGroup itemsPerRow={4} stackable>
        {[...Array(1)].map((_, index) => (
          <Card key={index} className="mb-4">
            <Dimmer active inverted>
              <Loader active inline="centered" />
            </Dimmer>

            <CardContent>
              <CardHeader>File Details</CardHeader>
              <CardMeta style={{ wordWrap: "break-word" }}>Hash: {generateRandomSHA256()}</CardMeta>
              <CardDescription style={{ wordWrap: "break-word" }}>
                Name : filename <br />
                Last Modified: <br />
                Transaction Timestamp:
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </CardGroup>

      <p className="mt-4">Total Files: -</p>
    </>
  );
}

export default FilesLoading;

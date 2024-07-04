import { Card, Icon, List, CardHeader, CardMeta, CardContent, CardDescription } from "semantic-ui-react";

export default function FileUploaderCard() {
  return (
    <Card>
      <CardContent>
        <CardHeader>Save your file!</CardHeader>
        <CardMeta>
          <span className="date">Drop a file here to save its informations on the blockchain</span>
        </CardMeta>

        <CardDescription>
          <Icon name="clock outline" />
          Waiting for file...
        </CardDescription>
      </CardContent>
      <CardContent extra>
        <a>
          <Icon name="ethereum" color="teal" />
          Check on etherscan
        </a>
      </CardContent>

      <CardContent extra>
        <List>
          <List.Item>
            <Icon name="file" />
            <List.Header>File details</List.Header>
            <List.Content>
              <List.Description>File name: </List.Description>
              <List.Description>Owner: </List.Description>
              <List.Description>Transaction hash: </List.Description>
            </List.Content>
          </List.Item>
        </List>
      </CardContent>
    </Card>
  );
}

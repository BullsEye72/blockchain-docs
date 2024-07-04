import { useMemo } from "react";
import { Form, FormField, Checkbox, Button, List, ListItem } from "semantic-ui-react";
import { handleSubmit } from "./EthereumSend";

export default function FileInfoSegment({ fileInfo, dispatch }) {
  const fileDateAndTimeText = useMemo(() => {
    if (fileInfo) {
      const date = new Date(fileInfo.lastModified);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
    return "";
  }, [fileInfo]);

  // Handle form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", fileInfo.name);
    formData.append("date", fileInfo.lastModified);
    formData.append("hash", fileInfo.hash);

    const result = await handleSubmit(formData);

    if (result.success === false) {
      return false;
    }

    if (result.success === true) {
      dispatch({ type: "SET_ETHEREUM_SEGMENT_STATUS", payload: true });
      dispatch({ type: "SET_FILE_INPUT_CAN_UPLOAD", payload: false });
    } else {
      dispatch({ type: "SET_ETHEREUM_SEGMENT_STATUS", payload: false });
      dispatch({ type: "SET_FILE_INPUT_CAN_UPLOAD", payload: true });
    }
  };

  return (
    <>
      {fileInfo && (
        <Form onSubmit={handleFormSubmit}>
          <List>
            <ListItem icon="file text" content={fileInfo.name} />
            <ListItem icon="calendar" content={fileDateAndTimeText} />
            <ListItem icon="hashtag" style={{ wordWrap: "anywhere" }} content={`${fileInfo.hash}`} />
            <ListItem icon="time" content={`Calculé en ${fileInfo.processingTime}ms`} />
          </List>
          <FormField>
            <Checkbox label="I agree to the Terms and Conditions" />
          </FormField>
          <Button type="submit">Submit</Button>
        </Form>
      )}
    </>
  );
}

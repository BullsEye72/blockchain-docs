"use client";

import { List, ListItem } from "semantic-ui-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const makeList = (n) => {
    const list = [];
    for (let i = 0; i < n; i++) {
      list.push(
        <ListItem as="a" onClick={() => handleClick(i)}>
          Files for user {i}
        </ListItem>
      );
    }
    return list;
  };

  const handleClick = (userId) => {
    router.push(`/files/${userId}`);
  };

  return (
    <>
      <List>{makeList(10)}</List>
    </>
  );
}

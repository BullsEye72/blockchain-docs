import { Header, Icon, Loader, Segment } from "semantic-ui-react";

export default function TestPage() {
  return (
    <>
      <Header>
        <Icon name="unlock alternate" />
        Votre fichier :
      </Header>

      <Segment>
        <Loader active inline />{" "}
        <p>
          Envoi et calcul du code de vérification en cours! <br />
          Votre fichier ne sera pas conservé à la fin de ce processus.
        </p>
      </Segment>
    </>
  );
}

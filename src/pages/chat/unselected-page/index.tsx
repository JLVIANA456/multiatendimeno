import ChatLayout from "../layouts";
import Icon from "common/components/icons";
import { useAppTheme } from "common/theme";
import { Container, ImageWrapper, Title, IconWrapper, Link, Image, Text } from "./styles";

export default function UnSelectedChatPage() {
  const theme = useAppTheme();

  const getImageURL = () => {
    if (theme.mode === "light") return "/assets/images/entry-image-light.webp";
    return "/assets/images/entry-image-dark.png";
  };

  return (
    <ChatLayout>
      <Container>
        <ImageWrapper>
          <Image src={getImageURL()} />
        </ImageWrapper>
        <Title> JLConecta+ </Title>
        <Text>
          Envie e receba mensagens sem manter seu celular online. <br />
          Use o JLConecta+ em até 4 dispositivos vinculados e 1 celular ao mesmo tempo.
        </Text>
        <Text>
          Desenvolvido para sua melhor experiência
        </Text>
      </Container>
    </ChatLayout>
  );
}

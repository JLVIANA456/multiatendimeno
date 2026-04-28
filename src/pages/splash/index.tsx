import {
  Container,
  EncryptionIcon,
  Link,
  Logo,
  LogoWrapper,
  Progress,
  SubTitle,
  Title,
} from "./styles";

type SplashPageProps = {
  progress: number;
};

export default function SplashPage(props: SplashPageProps) {
  const { progress } = props;

  return (
    <Container>
      <LogoWrapper>
        <Logo id="whatsapp" />
      </LogoWrapper>
      <Progress progess={progress} />
      <Title>JLConecta+</Title>
      <SubTitle>
        <EncryptionIcon id="lock" /> Criptografado de ponta a ponta. 
        Sua privacidade é nossa prioridade.
      </SubTitle>
    </Container>
  );
}

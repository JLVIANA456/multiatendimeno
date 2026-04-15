import Icon from "common/components/icons";
import {
  AboutItem,
  ActionSection,
  ActionText,
  Avatar,
  AvatarWrapper,
  Heading,
  HeadingWrapper,
  MediaButton,
  MediaImage,
  MediaImagesWrapper,
  PersonalInfo,
  ProfileName,
  Section,
  Wrapper,
} from "./styles";

type ProfileSectionProps = {
  name: string;
  image: string;
  phone?: string;
};

export default function ProfileSection(props: ProfileSectionProps) {
  const { name, image, phone } = props;

  const handleBlock = () => {
    if (window.confirm(`Deseja realmente bloquear o contato ${name}? Você não receberá mais mensagens desta pessoa.`)) {
        alert("Contato bloqueado com sucesso!");
    }
  };

  const handleReport = () => {
    if (window.confirm(`Deseja denunciar o contato ${name} por spam ou abuso? O histórico será enviado para análise.`)) {
        alert("Denúncia enviada. Obrigado por nos ajudar a manter o sistema seguro!");
    }
  };

  const handleDeleteChat = () => {
    if (window.confirm(`Tem certeza que deseja apagar toda a conversa com ${name}? Esta ação não pode ser desfeita.`)) {
        alert("Histórico de conversa apagado permanentemente.");
    }
  };

  return (
    <Wrapper>
      <PersonalInfo>
        <AvatarWrapper>
          <Avatar src={image} alt="Perfil do Usuário" />
        </AvatarWrapper>
        <ProfileName>{name}</ProfileName>
      </PersonalInfo>

      <Section>
        <HeadingWrapper>
          <Heading>Mídia, Links e Documentos</Heading>
          <MediaButton title="Ver todos">
            <Icon id="rightArrow" className="icon" />
          </MediaButton>
        </HeadingWrapper>
        <MediaImagesWrapper>
          <MediaImage src="/assets/images/placeholder.jpeg" alt="Mídia" />
          <MediaImage src="/assets/images/placeholder.jpeg" alt="Mídia" />
          <MediaImage src="/assets/images/placeholder.jpeg" alt="Mídia" />
        </MediaImagesWrapper>
      </Section>

      <Section>
        <HeadingWrapper>
          <Heading>Sobre e número de telefone</Heading>
        </HeadingWrapper>
        <ul>
          <AboutItem>
            Disponível
          </AboutItem>
          <AboutItem>{phone ? `+${phone}` : "Número não disponível"}</AboutItem>
        </ul>
      </Section>

      <ActionSection className="hover:!text-red-500 cursor-pointer" onClick={handleBlock}>
        <Icon id="block" className="icon" />
        <ActionText>Bloquear Contato</ActionText>
      </ActionSection>
      <ActionSection className="hover:!text-red-500 cursor-pointer" onClick={handleReport}>
        <Icon id="thumbsDown" className="icon" />
        <ActionText>Denunciar Contato</ActionText>
      </ActionSection>
      <ActionSection className="hover:!text-red-500 cursor-pointer" onClick={handleDeleteChat}>
        <Icon id="delete" className="icon" />
        <ActionText>Apagar Conversa</ActionText>
      </ActionSection>
    </Wrapper>
  );
}

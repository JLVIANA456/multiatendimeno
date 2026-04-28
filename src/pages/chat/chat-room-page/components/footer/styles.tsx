import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  padding: 10px;
  min-height: 60px;
  max-height: 180px;
  position: relative;
  display: flex;
  align-items: flex-end;
  transition: min-height 0.15s ease;
`;

export const iconCommonStyles = css`
  color: ${(props) => props.theme.common.subHeadingColor};
`;

export const IconsWrapper = styled.div`
  position: relative;
`;

export const AttachButton = styled.button`
  margin-left: 10px;

  .icon {
    ${iconCommonStyles}
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 50px;
`;

export const Button = styled.button<{ readonly showIcon: boolean }>`
  transform: ${(props) => (props.showIcon ? "scale(1)" : "scale(0)")};
  opacity: ${(props) => (props.showIcon ? 1 : 0)};
  transition: all 0.5s ease;
  margin-bottom: 10px;

  &:nth-of-type(1) {
    transition-delay: 0.25s;
  }

  &:nth-of-type(2) {
    transition-delay: 0.2s;
  }

  &:nth-of-type(3) {
    transition-delay: 0.15s;
  }

  &:nth-of-type(4) {
    transition-delay: 0.1s;
  }

  &:nth-of-type(5) {
    transition-delay: 0.05s;
  }
`;

export const Input = styled.textarea`
  background: ${(props) => props.theme.common.secondaryColor};
  color: ${(props) => props.theme.common.subHeadingColor};

  padding: 12px 15px;
  border-radius: 15px;
  flex: 1;
  margin-left: 7px;
  border: none;
  resize: none;
  font-family: inherit;
  font-size: 0.9rem;
  min-height: 20px;
  max-height: 120px;
  display: flex;
  align-items: center;

  &::placeholder {
    color: ${(props) => props.theme.common.subHeadingColor};
    font-size: 0.9rem;
  }

  &:focus {
    outline: none;
  }

  /* Scrollbar escondida para manter o design clean */
  &::-webkit-scrollbar {
    width: 0px;
  }
`;

export const SendMessageButton = styled.button`
  .icon {
    margin-left: 8px;
    margin-right: 8px;
    width: 28px;
    height: 28px;
    padding: 3px;
    border-radius: 50%;
    ${iconCommonStyles}
  }
`;

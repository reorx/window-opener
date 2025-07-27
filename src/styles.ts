import { css } from '@emotion/react';


export const themeColor = '#1d9bf0'

export const textButton = css`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: #222;
    text-decoration: underline;
  }
`

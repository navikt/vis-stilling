import type { FunctionComponent, ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

const NaturligLinjeskift: FunctionComponent<Props> = ({ children }) => (
    <>
        {typeof children === 'string'
            ? children.split('/').map((snutt, index) =>
                  index === 0 ? (
                      snutt
                  ) : (
                      <>
                          /<wbr />
                          {snutt}
                      </>
                  )
              )
            : children}
    </>
);

export default NaturligLinjeskift;

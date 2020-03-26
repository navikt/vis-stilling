import React, { FunctionComponent } from 'react';

const NaturligLinjeskift: FunctionComponent = ({ children }) => (
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

import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';
import { apiRequest } from '../../../platform/utilities/api';
// window.React = React;
// window.ReactDOM = ReactDOM;


const getBotToken = csrfToken => {
  const path = `https://directline.botframework.com/v3/directline/tokens/generate`;

  return apiRequest(path, {
    method: 'POST',
    credentials: 'include',
    mode: 'cors',
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  });
};

const BotActivityDecorator = ({ children }) => {
  return <div className="botActivityDecorator">{children}</div>;
};

const activityMiddleware = () => next => (...setupArgs) => {
  const [card] = setupArgs;
  if (card.activity.from.role === 'bot') {
    return (...renderArgs) => (
      <BotActivityDecorator
        activityID={card.activity.id}
        key={card.activity.id}
      >
        {next(card)(...renderArgs)}
      </BotActivityDecorator>
    );
  }
  return next(...setupArgs);
};

export default function App() {
  // const [isLoaded, setLoaded] = useState(!!window.WebChat);
  //
  // if (!isLoaded) {
  //   setTimeout(() => {
  //     if (window.WebChat) {
  //       setLoaded(true);
  //     }
  //   }, 300);
  //   return 'waiting on webchat framework . . .';
  // }

  return <ActualApp />;
}

function ActualApp() {
  // const { ReactWebChat, createDirectLine } = window.WebChat;

  const directLine = useMemo(
    () =>
      createDirectLine({
        // domain:
        //   'https://northamerica.directline.botframework.com/v3/directline',
        token: getBotToken(),
      }),
    [],
  );

  return (
    <div className={'vads-l-grid-container'}>
      <div className={'vads-l-row'} style={{ height: '200px' }}>
        <ReactWebChat
          activityMiddleware={activityMiddleware}
          directLine={directLine}
          userID="12345"
        />
      </div>
    </div>
  );
}

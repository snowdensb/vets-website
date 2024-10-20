export const mockFolderResponse = {
  data: {
    id: '0',
    type: 'folders',
    attributes: {
      folderId: 0,
      name: 'Inbox',
      count: 3,
      unreadCount: 3,
      systemFolder: false,
    },
    links: { self: 'https://staging-api.va.gov/v0/messaging/health/folders/0' },
  },
};

export const mockFolderErrorResponse = {
  errors: [
    {
      title: 'Bad Request',
      detail: 'Received a bad request response from the upstream server',
      code: 'EVSS400',
      source: 'EVSS::DisabilityCompensationForm::Service',
      status: '400',
      meta: {},
    },
  ],
};

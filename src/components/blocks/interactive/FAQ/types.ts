export interface QAItem {
  blockType: 'qa';
  question: {
    root: {
      children: Array<{
        type: string;
        children?: Array<{
          text?: string;
          type?: string;
        }>;
      }>;
    };
  };
  answer: {
    root: {
      children: Array<{
        type: string;
        children?: Array<{
          text?: string;
          type?: string;
        }>;
      }>;
    };
  };
}

export interface QAGroup {
  blockType: 'qaGroup';
  title: string;
  items: QAItem[];
}

export type QAItemOrGroup = QAItem | QAGroup;

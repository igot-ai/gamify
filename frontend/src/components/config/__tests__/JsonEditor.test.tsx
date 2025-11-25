import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JsonEditor } from '../JsonEditor';

jest.mock('@/components/config/JsonDiffViewer', () => ({
  JsonDiffViewer: () => <div data-testid="json-diff-viewer" />,
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('JsonEditor', () => {
  const getTextarea = () =>
    screen.getByPlaceholderText(/enter json configuration/i) as HTMLTextAreaElement;

  const renderEditor = (initialValue: any) =>
    render(<JsonEditor configType="ads" initialValue={initialValue} defaultView="json" />);

  it('renders the provided initial JSON payload', async () => {
    const initialValue = { network: 'applovin', placements: [] };

    renderEditor(initialValue);

    await waitFor(() => {
      expect(getTextarea().value).toBe(JSON.stringify(initialValue, null, 2));
    });
  });

  it('replaces editor content when a new initialValue is provided', async () => {
    const firstConfig = { network: 'admob', session: 'draft-A' };
    const secondConfig = { network: 'applovin', session: 'draft-B', placements: ['rewarded'] };

    const { rerender } = renderEditor(firstConfig);

    await waitFor(() => {
      expect(getTextarea().value).toBe(JSON.stringify(firstConfig, null, 2));
    });

    fireEvent.change(getTextarea(), {
      target: { value: JSON.stringify({ network: 'custom' }, null, 2) },
    });

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /save configuration/i })
      ).not.toBeDisabled()
    );

    rerender(<JsonEditor configType="ads" initialValue={secondConfig} />);

    await waitFor(() => {
      expect(getTextarea().value).toBe(JSON.stringify(secondConfig, null, 2));
    });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /save configuration/i })).toBeDisabled()
    );
  });
});



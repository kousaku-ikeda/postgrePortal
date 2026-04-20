import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MainLayout from '../components/MainLayout';

describe('MainLayout', () => {
  it('renders the header with application title', () => {
    render(<MainLayout />);
    expect(screen.getByText('PostgreSQL 管理ポータル')).toBeInTheDocument();
  });

  it('renders left pane', () => {
    render(<MainLayout />);
    const leftPane = screen.getByTestId('left-pane');
    expect(leftPane).toBeInTheDocument();
  });

  it('renders right pane', () => {
    render(<MainLayout />);
    const rightPane = screen.getByTestId('right-pane');
    expect(rightPane).toBeInTheDocument();
  });

  it('displays 2-column layout with left and right panes', () => {
    render(<MainLayout />);
    const leftPane = screen.getByTestId('left-pane');
    const rightPane = screen.getByTestId('right-pane');
    expect(leftPane).toBeInTheDocument();
    expect(rightPane).toBeInTheDocument();
  });
});

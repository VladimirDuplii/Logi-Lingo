import React from 'react';
import { Button } from './button';

export const PrimaryButton = ({ children, className='', ...rest }) => (
  <Button variant="default" size="sm" className={className} {...rest}>{children}</Button>
);

export const SecondaryButton = ({ children, className='', ...rest }) => (
  <Button variant="outline" size="sm" className={className} {...rest}>{children}</Button>
);

export const DangerButton = ({ children, className='', ...rest }) => (
  <Button variant="destructive" size="sm" className={className} {...rest}>{children}</Button>
);

// TODO: Replace imports project-wide to use { Button } directly and delete old files.

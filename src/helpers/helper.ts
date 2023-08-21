

export const createFullName= (firstName: string, lastName: string, paternalName: string): string => {
  return `${firstName.trim()} ${lastName.trim()} ${paternalName.trim()}`;
};


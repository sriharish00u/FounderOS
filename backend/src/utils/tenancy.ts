import { Schema } from 'mongoose';

export const tenancyPlugin = (schema: Schema): void => {
  const requireScope = function (this: any): void {
    const opts = this.getOptions ? this.getOptions() : {};
    if (opts.bypassTenancy) return;
    const filter = (this.getFilter ? this.getFilter() : this.getQuery()) || {};
    if (!filter.companyCode) {
      throw new Error('Tenancy violation: companyCode filter is required on tenant-scoped queries');
    }
  };

  schema.pre('find', requireScope);
  schema.pre('findOne', requireScope);
  schema.pre('countDocuments', requireScope);
  schema.pre('findOneAndUpdate', requireScope);
  schema.pre('findOneAndDelete', requireScope);
  schema.pre('updateMany', requireScope);
  schema.pre('updateOne', requireScope);
  schema.pre('deleteMany', requireScope);
  schema.pre('deleteOne', requireScope);
};
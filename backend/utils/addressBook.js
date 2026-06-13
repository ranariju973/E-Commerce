import mongoose from 'mongoose'

const ADDRESS_FIELDS = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'pincode', 'country', 'phone']

const normalizeAddress = (rawAddress = {}) => (
    ADDRESS_FIELDS.reduce((normalizedAddress, field) => {
        normalizedAddress[field] = `${rawAddress?.[field] || ''}`.trim()
        return normalizedAddress
    }, {})
)

const hasAddressValue = (address = {}) => (
    ADDRESS_FIELDS.some((field) => `${address?.[field] || ''}`.trim() !== '')
)

const normalizeAddressEntry = (rawAddress = {}) => {
    const normalizedAddress = normalizeAddress(rawAddress)

    if (!hasAddressValue(normalizedAddress)) {
        return null
    }

    return {
        id: `${rawAddress?.id || rawAddress?._id || new mongoose.Types.ObjectId().toString()}`,
        ...normalizedAddress
    }
}

const areAddressesEqual = (firstAddress = {}, secondAddress = {}) => {
    const normalizedFirstAddress = normalizeAddress(firstAddress)
    const normalizedSecondAddress = normalizeAddress(secondAddress)

    return ADDRESS_FIELDS.every((field) => normalizedFirstAddress[field] === normalizedSecondAddress[field])
}

const normalizeAddressBook = (rawAddresses = [], legacyAddress = {}, rawDefaultAddressId = '') => {
    const normalizedAddresses = []

    if (Array.isArray(rawAddresses)) {
        for (const rawAddress of rawAddresses) {
            const normalizedEntry = normalizeAddressEntry(rawAddress)
            if (normalizedEntry) {
                normalizedAddresses.push(normalizedEntry)
            }
        }
    }

    if (normalizedAddresses.length === 0) {
        const legacyEntry = normalizeAddressEntry(legacyAddress)
        if (legacyEntry) {
            normalizedAddresses.push(legacyEntry)
        }
    }

    const defaultAddressId = normalizedAddresses.some((address) => address.id === rawDefaultAddressId)
        ? rawDefaultAddressId
        : (normalizedAddresses[0]?.id || '')

    return {
        addresses: normalizedAddresses,
        defaultAddressId
    }
}

const upsertAddressBook = ({
    currentAddresses = [],
    legacyAddress = {},
    defaultAddressId = '',
    nextAddress = {},
    selectedAddressId = ''
}) => {
    const addressBook = normalizeAddressBook(currentAddresses, legacyAddress, defaultAddressId)
    const normalizedNextAddress = normalizeAddress(nextAddress)

    if (!hasAddressValue(normalizedNextAddress)) {
        return addressBook
    }

    const nextAddresses = [...addressBook.addresses]
    let resolvedAddressId = ''

    const selectedAddressIndex = nextAddresses.findIndex((address) => address.id === selectedAddressId)
    if (selectedAddressIndex >= 0) {
        resolvedAddressId = nextAddresses[selectedAddressIndex].id
        nextAddresses[selectedAddressIndex] = {
            id: resolvedAddressId,
            ...normalizedNextAddress
        }
    } else {
        const matchingAddress = nextAddresses.find((address) => areAddressesEqual(address, normalizedNextAddress))

        if (matchingAddress) {
            resolvedAddressId = matchingAddress.id
        } else {
            resolvedAddressId = new mongoose.Types.ObjectId().toString()
            nextAddresses.unshift({
                id: resolvedAddressId,
                ...normalizedNextAddress
            })
        }
    }

    return {
        addresses: nextAddresses,
        defaultAddressId: resolvedAddressId || addressBook.defaultAddressId
    }
}

export {
    ADDRESS_FIELDS,
    normalizeAddress,
    hasAddressValue,
    normalizeAddressBook,
    upsertAddressBook
}

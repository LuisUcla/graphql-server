import {gql, ApolloServer} from "apollo-server";
import { v1 as uuid} from "uuid" // para hacer ids ficticios cuando se hace un post (registro)

const persons = [
    {
        name: 'luis',
        phone: '014-56532',
        street: 'calle 3 de frente',
        city: 'Caracas',
        id: 1
    },
    {
        name: 'Jose',
        phone: '014-4581212',
        street: 'calle 4 detras',
        city: 'San Felipe',
        id: 2
    },
    {
        name: 'Maria',
        street: 'calle 4 debajo',
        city: 'Chivacoa',
        id: 3
    }
]

// las declaraciones de los tipos que se necesita para obtener la info
const typeDefs = gql` 
    enum YesNo {
        YES
        NO
    }

    type Address {
        street: String!
        city: String!
    }

    type person {
        name: String
        phone: String
        address: Address!  
        id: ID!
    }

    type Query {
        personCount: Int!
        allPersons: [person]!
        allPersonPhone(phone: YesNo): [person]!
        findPerson(name: String!): person
    }

    type Mutation {
        addPerson(
            name: String!
            phone: String
            street: String!
            city: String!
        ): person

        editNumber(
            name: String!
            phone: String!
        ): person

        deletePerson(name: String!): person
    }
`

const resolvers = { // la logica de las querys
    Query: {
        personCount: () => persons.length,
        allPersonPhone: (root, args) => {
            if (!args.phone) return persons;
    
            return persons.filter(person => 
                args.phone === "YES" ? person.phone : !person.phone
            )
        },
        allPersons: () => persons,
        findPerson: (root, args) => {
            const { name } = args
            return persons.find(person => person.name === name)
        }
    },
    Mutation: { // para cambiar los datos, hacer registros, updates, deletes, gets
        addPerson: (root, args) => {
            const person = { ...args, id: uuid() }
            persons.push(person)
            return person
        },
        editNumber: (root, args) => {
            const personIndex = persons.findIndex(person => person.name === args.name);
            if (personIndex === -1) {
                return null;
            }
            
            const person = persons[personIndex]

            const updatePerson = { ...person, phone: args.phone };
            persons[personIndex] = updatePerson;

            return updatePerson;

        },
        deletePerson: (root, args) => {
           const { name } = args;
            const personDelete = persons.findIndex(person => person.name == name);
            if (personDelete === -1) {
                return null
            }

           return persons.splice(personDelete, 1)
        }
    },
    person: { // resolver personalizado para obtener data
        address: (root) => {
            return {
                street: root.street,
                city: root.city
            }
        }
    }
    
}

const server = new ApolloServer({ // conexion con el servidor de apollo-server
    typeDefs,
    resolvers
})

server.listen().then(({url}) => { // escucha en el puerto 4000 
    console.log(`Server ready at ${url}`)
})